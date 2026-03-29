<div align="center">
  <h1 align="center">BabelRoom</h1>
  <p align="center">
    <strong>Real-time Multilingual Voice-Cloned Teleconferencing</strong>
  </p>
</div>

## 🌐 Overview
BabelRoom is a next-generation teleconferencing application that breaks down language barriers. Using cutting-edge AI, it captures your speech, translates it in real-time to your partner's native language, and synthesizes the translated text *using a perfect clone of your own voice*. 

It feels like you are fluently speaking another language natively.

## ⚡ Tech Stack
Built entirely on the Edge for near-zero latency worldwide:
- **Frontend**: React, Vite, Tailwind CSS, Motion
- **Architecture**: Cloudflare Workers
- **Real-time State**: Cloudflare Durable Objects (WebSocket signaling & state management)
- **Speech-to-Text**: Cloudflare Workers AI (`@cf/openai/whisper`)
- **Translation Engine**: Cloudflare Workers AI (`@cf/meta/llama-3-8b-instruct`)
- **Voice Synthesis**: ElevenLabs Instant Voice Cloning
- **Auth**: Google OAuth

## 🚀 Features
- **Push-to-Talk Networking**: Secure cryptographic WebSocket bridges with remote peer status broadcasting.
- **Zero-Shot Voice Calibration**: Instantly clone your voice entirely in the browser using a custom WebM-to-WAV transcoder.
- **Cross-Lingual Realism**: Supports 10 major global languages with deep emotional prosody matching.
- **Matrix Dashboard**: Cyberpunk-inspired UI displaying real-time uptime, instant join networking, and dynamic translation timelines.

## 🛠️ Local Development
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Set up your `.env` for the Frontend:
   ```env
   VITE_GOOGLE_CLIENT_ID="your_google_oauth_client_id"
   VITE_WORKER_URL="http://localhost:8787"
   ```
3. Set up the Backend (Cloudflare Worker):
   ```bash
   cd cloudflare-worker
   npm install
   ```
   Create a `.dev.vars` file inside the `cloudflare-worker` directory:
   ```env
   ELEVENLABS_API_KEY="your_api_key_from_paid_tier"
   ```
4. Start the Development Servers:
   **Terminal 1 (Backend):**
   ```bash
   cd cloudflare-worker
   npx wrangler dev
   ```
   **Terminal 2 (Frontend):**
   ```bash
   npm run dev
   ```

## 🌍 Production Deployment
The application is fully configured for Cloudflare's ecosystem:
- **Frontend**: Deployed via Cloudflare Pages (`npx wrangler pages deploy dist`)
- **Backend**: Deployed via Cloudflare Workers (`npx wrangler deploy`)
- **Secrets**: Bound via `npx wrangler secret put ELEVENLABS_API_KEY`
