import { DurableObject } from "cloudflare:workers";

export interface Env {
  BABEL_ROOM: DurableObjectNamespace;
  AI: any;
  ELEVENLABS_API_KEY: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Phase 1: Voice Calibration (Cloning)
    if (url.pathname === "/api/clone-voice" && request.method === "POST") {
      try {
        const formData = await request.formData();

        // --- PAID PLAN CODE ---
        const elResponse = await fetch("https://api.elevenlabs.io/v1/voices/add", {
          method: "POST",
          headers: {
            "xi-api-key": env.ELEVENLABS_API_KEY
          },
          body: formData
        });

        const data = await elResponse.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // Phase 2: The Lobby (Connect to Durable Object Room)
    if (url.pathname.startsWith("/room/")) {
      const roomId = url.pathname.split("/")[2];
      if (!roomId) return new Response("Room ID required", { status: 400, headers: corsHeaders });

      const id = env.BABEL_ROOM.idFromName(roomId);
      const room = env.BABEL_ROOM.get(id);
      return room.fetch(request);
    }

    return new Response("Not found", { status: 404, headers: corsHeaders });
  }
};

// Phase 3: The Real-Time Translation Pipeline (Durable Object)
export class BabelRoom extends DurableObject {
  sessions: Map<WebSocket, { voiceId: string, targetLang: string, userProfile?: any }> = new Map();
  env: Env;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get("Upgrade");
    if (!upgradeHeader || upgradeHeader !== "websocket") {
      return new Response("Expected Upgrade: websocket", { status: 426 });
    }

    const url = new URL(request.url);
    const voiceId = url.searchParams.get("voice_id") || "";
    const targetLang = url.searchParams.get("target_lang") || "en";

    const webSocketPair = new WebSocketPair();
    const client = webSocketPair[0];
    const server = webSocketPair[1];

    this.sessions.set(server, { voiceId, targetLang });

    server.accept();

    server.addEventListener("message", async (event) => {
      try {
        // Differentiate between JSON config and Binary audio data
        if (typeof event.data === "string") {
          const msg = JSON.parse(event.data);
          if (msg.type === "config") {
            const info = this.sessions.get(server);
            if (info && msg.userProfile) {

              // 1. Evict any ghost connections from this exact user
              for (const [existingSocket, existingInfo] of this.sessions.entries()) {
                if (existingSocket !== server && existingInfo.userProfile?.email === msg.userProfile.email) {
                  try { existingSocket.close(1008, "Replaced by new connection"); } catch (e) { }
                  this.sessions.delete(existingSocket);
                }
              }

              // 2. Enforce the max 2 room limit NOW that ghosts are cleared
              let otherUsersCount = 0;
              for (const [existingSocket] of this.sessions.entries()) {
                if (existingSocket !== server) otherUsersCount++;
              }

              if (otherUsersCount >= 2) {
                server.send(JSON.stringify({ type: "error", message: "Room is full. Maximum 2 participants allowed." }));
                server.close(1008, "Room full");
                this.sessions.delete(server);
                return;
              }

              // 3. Keep the session
              info.voiceId = msg.voiceId;
              info.targetLang = msg.targetLang;
              info.userProfile = msg.userProfile;
            }
            this.broadcastPeers();
          } else if (msg.type === "is_speaking") {
            for (const [session] of this.sessions.entries()) {
              if (session !== server) {
                try { session.send(JSON.stringify({ type: "remote_speaking", status: msg.status })); } catch (e) { }
              }
            }
          }
          return; // Do not pass string config to Whisper
        }

        // Step 1: Audio Capture received from Frontend
        const audioBytes = event.data as ArrayBuffer;
        if (!audioBytes || audioBytes.byteLength === 0) return;

        const senderInfo = this.sessions.get(server);

        if (!senderInfo) return;

        // Step 2: Transcription (Cloudflare Workers AI - Whisper)
        const audioArray = [...new Uint8Array(audioBytes)];
        const transcription = await this.env.AI.run('@cf/openai/whisper', {
          audio: audioArray
        });
        const text = transcription.text;

        // Broadcast to other users in the room
        for (const [session, info] of this.sessions.entries()) {
          if (session !== server) {
            // Step 3: Translation (Cloudflare Workers AI - Llama 3)
            const translation = await this.env.AI.run('@cf/meta/llama-3-8b-instruct', {
              messages: [
                { role: "system", content: `You are a highly accurate translator. Translate the following text to ${info.targetLang}. Only output the translated text, nothing else. No quotes, no explanations.` },
                { role: "user", content: text }
              ]
            });
            const translatedText = translation.response;

            // Step 4: Voice Generation (ElevenLabs TTS)
            let audioBuffer: ArrayBuffer | null = null;
            if (info.voiceId) {
              const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${senderInfo.voiceId}`, {
                method: "POST",
                headers: {
                  "xi-api-key": this.env.ELEVENLABS_API_KEY,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  text: translatedText,
                  model_id: "eleven_multilingual_v2"
                })
              });
              if (ttsResponse.ok) {
                audioBuffer = await ttsResponse.arrayBuffer();
              } else {
                const errText = await ttsResponse.text();
                server.send(JSON.stringify({ type: "error", message: `ElevenLabs TTS Failed. Are you out of Free Tier credits?: ${errText}` }));
              }
            }

            // Step 5: Playback (Send back to Frontend)
            // First send the transcript metadata
            session.send(JSON.stringify({
              type: "transcript",
              original: text,
              translated: translatedText,
              senderVoiceId: senderInfo.voiceId
            }));

            // Then send the audio bytes if available
            if (audioBuffer) {
              session.send(audioBuffer);
            }
          }
        }
      } catch (err: any) {
        console.error("Pipeline Error:", err);
        server.send(JSON.stringify({ type: "error", message: err.message }));
      }
    });

    server.addEventListener("close", () => {
      this.sessions.delete(server);
      this.broadcastPeers();
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  broadcastPeers() {
    const peers: any[] = [];
    for (const info of this.sessions.values()) {
      if (info.userProfile) peers.push(info.userProfile);
    }

    const msg = JSON.stringify({ type: "peers_update", peers });
    for (const session of this.sessions.keys()) {
      try {
        session.send(msg);
      } catch (err) { }
    }
  }
}
