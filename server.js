const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fetch = require('node-fetch');
const path = require('path');
const { Readable } = require('stream');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
app.use(express.static(path.join(__dirname, 'public')));

const wss = new WebSocket.Server({ server });

const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyD9L9fzh-W7FGu12BYEXS47DrHNfM7YBMk";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

const SYSTEM_INSTRUCTIONS = `
You are a helpful AI assistant for Revolt Motors. Your purpose is to provide information
about Revolt Motors' products, services, features, and company information.
You must stay on topic and provide accurate information about Revolt Motors.
Avoid discussing any other topics. Be concise and conversational.
`;

wss.on('connection', (ws) => {
  console.log('Client connected');
  let audioBuffer = Buffer.alloc(0);

  ws.on('message', async (message) => {
    try {
      if (typeof message === 'string') {
        const { type } = JSON.parse(message);
        if (type === 'start') {
          audioBuffer = Buffer.alloc(0);
          return;
        }
      }

      if (message instanceof Buffer) {
        audioBuffer = Buffer.concat([audioBuffer, message]);
        return;
      }

      if (message.type === 'audio-end') {
        // For debugging: Save received audio
        fs.writeFileSync('debug_audio.wav', audioBuffer);
        
        const response = await callGeminiAPI(audioBuffer);
        ws.send(JSON.stringify({ text: response }));
      }
    } catch (err) {
      console.error('Error:', err);
      ws.send(JSON.stringify({ error: err.message }));
    }
  });

  async function callGeminiAPI(audioData) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: SYSTEM_INSTRUCTIONS },
              {
                inlineData: {
                  mimeType: "audio/wav",
                  data: audioData.toString('base64')
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.5,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 1024
          }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API error: ${error}`);
      }

      const result = await response.json();
      return result.candidates[0].content.parts[0].text;
    } catch (err) {
      console.error('API request failed:', err);
      throw err;
    }
  }

  ws.on('close', () => console.log('Client disconnected'));
});

server.listen(3000, () => console.log('Server running on port 3000'));