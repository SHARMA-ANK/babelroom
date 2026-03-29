var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-Z7if4N/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// src/index.ts
import { DurableObject } from "cloudflare:workers";
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if (url.pathname === "/api/clone-voice" && request.method === "POST") {
      try {
        const formData = await request.formData();
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
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }
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
var BabelRoom = class extends DurableObject {
  static {
    __name(this, "BabelRoom");
  }
  sessions = /* @__PURE__ */ new Map();
  env;
  constructor(ctx, env) {
    super(ctx, env);
    this.env = env;
  }
  async fetch(request) {
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
        if (typeof event.data === "string") {
          const msg = JSON.parse(event.data);
          if (msg.type === "config") {
            const info = this.sessions.get(server);
            if (info && msg.userProfile) {
              for (const [existingSocket, existingInfo] of this.sessions.entries()) {
                if (existingSocket !== server && existingInfo.userProfile?.email === msg.userProfile.email) {
                  try {
                    existingSocket.close(1008, "Replaced by new connection");
                  } catch (e) {
                  }
                  this.sessions.delete(existingSocket);
                }
              }
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
              info.voiceId = msg.voiceId;
              info.targetLang = msg.targetLang;
              info.userProfile = msg.userProfile;
            }
            this.broadcastPeers();
          } else if (msg.type === "is_speaking") {
            for (const [session] of this.sessions.entries()) {
              if (session !== server) {
                try {
                  session.send(JSON.stringify({ type: "remote_speaking", status: msg.status }));
                } catch (e) {
                }
              }
            }
          }
          return;
        }
        const audioBytes = event.data;
        if (!audioBytes || audioBytes.byteLength === 0) return;
        const senderInfo = this.sessions.get(server);
        if (!senderInfo) return;
        const audioArray = [...new Uint8Array(audioBytes)];
        const transcription = await this.env.AI.run("@cf/openai/whisper", {
          audio: audioArray
        });
        const text = transcription.text;
        for (const [session, info] of this.sessions.entries()) {
          if (session !== server) {
            const translation = await this.env.AI.run("@cf/meta/llama-3-8b-instruct", {
              messages: [
                { role: "system", content: `You are a highly accurate translator. Translate the following text to ${info.targetLang}. Only output the translated text, nothing else. No quotes, no explanations.` },
                { role: "user", content: text }
              ]
            });
            const translatedText = translation.response;
            let audioBuffer = null;
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
            session.send(JSON.stringify({
              type: "transcript",
              original: text,
              translated: translatedText,
              senderVoiceId: senderInfo.voiceId
            }));
            if (audioBuffer) {
              session.send(audioBuffer);
            }
          }
        }
      } catch (err) {
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
    const peers = [];
    for (const info of this.sessions.values()) {
      if (info.userProfile) peers.push(info.userProfile);
    }
    const msg = JSON.stringify({ type: "peers_update", peers });
    for (const session of this.sessions.keys()) {
      try {
        session.send(msg);
      } catch (err) {
      }
    }
  }
};

// ../../../Users/ankit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../Users/ankit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-Z7if4N/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../Users/ankit/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-Z7if4N/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  BabelRoom,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
