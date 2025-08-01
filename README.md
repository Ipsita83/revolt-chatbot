# revolt-chatbot
# Revolt Chatbot

A voice-enabled AI chatbot for **Revolt Motors**, built using Node.js, WebSocket, and the Gemini API. This chatbot listens to user audio, transcribes it, sends the text to Gemini, and returns a relevant spoken or textual response related to Revolt Motors' offerings.

---

## 🚀 Features

- Real-time voice chat with AI
- WebSocket-based audio communication
- Integrated with Gemini API (Google's LLM)
- Custom system instructions for Revolt Motors
- Lightweight Express server
- Static frontend hosted under `/public`

---

## 📁 Project Structure

revolt-chatbot/
├── public/ # Frontend files (HTML, JS, CSS)
├── server.js # Backend Express + WebSocket server
├── package.json # Project metadata and dependencies
└── node_modules/ # Installed dependencies


---

## 🛠️ Requirements

- Node.js (v16+ recommended)
- Gemini API Key from Google (set as `GEMINI_API_KEY` in `.env` or environment)

---

## 🔧 Setup Instructions

1. **Install dependencies:**

   ```bash
   npm install
Run the server: npm start
Access the chatbot:

Open your browser at http://localhost:3000
