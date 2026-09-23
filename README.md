# J.A.R.V.I.S — AI Voice Assistant

A full-stack, voice-controlled AI assistant inspired by Iron Man's JARVIS — built from scratch with Python, Flask, and a custom futuristic web interface.

![Status](https://img.shields.io/badge/status-active-brightgreen)

## Overview

JARVIS listens to voice or typed commands, sends them to Google's Gemini AI for a response, and speaks the answer back using text-to-speech. It runs as a lightweight local web app: a Flask backend handles AI logic and speech processing, while a custom HTML/CSS/JS frontend provides a HUD-style chat interface.

## Features

- **Conversational AI** — powered by Google Gemini for natural language responses
- **Voice input** — record your voice directly in the browser (MediaRecorder API) and get it transcribed via speech recognition
- **Text-to-speech output** — ElevenLabs for natural voice, with a free browser-based fallback
- **Custom HUD interface** — arc-reactor style animated orb, live diagnostics panel, corner-bracket sci-fi frame
- **Time-aware greeting** — greets the user differently based on time of day (morning/afternoon/evening/night)
- **Built-in commands** — open apps (Notepad, Calculator, Spotify), Google search, current date/time
- **Graceful error handling** — falls back cleanly when an API quota or service is temporarily unavailable

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask |
| AI | Google Gemini API |
| Voice (speech-to-text) | SpeechRecognition, pydub, ffmpeg |
| Voice (text-to-speech) | ElevenLabs API, Web Speech API |
| Frontend | HTML, CSS, JavaScript |

## Project Structure

```
├── app.py                  # Flask backend (chat + voice routes)
├── jarvis.py                # Core assistant logic (brain, speak, commands)
├── jarvis-frontend/
│   └── files/
│       ├── index.html       # HUD interface structure
│       ├── styles.css       # HUD styling and animations
│       └── script.js        # Frontend logic + API calls
└── .gitignore
```

## Setup

1. Clone this repository
   ```
   git clone https://github.com/rajatv212001-bit/Jarvis-ai-agent.git
   ```

2. Install Python dependencies
   ```
   pip install flask flask-cors python-dotenv google-genai elevenlabs sounddevice scipy speechrecognition pydub
   ```

3. Install [ffmpeg](https://www.gyan.dev/ffmpeg/builds/) and add it to your system PATH (required for voice processing)

4. Create a `.env` file in the root folder with your API keys:
   ```
   GEMINI_API_KEY=your_key_here
   ELEVENLABS_API_KEY=your_key_here
   ```

5. Run the backend
   ```
   python app.py
   ```

6. Open `jarvis-frontend/files/index.html` in your browser

## Screenshots

*(Add a screenshot or short demo GIF of the HUD interface here)*

## Roadmap

- [ ] WhatsApp integration
- [ ] Persistent memory across sessions
- [ ] Deploy as a standalone desktop app

## Author

**Rajat Singh**
B.Tech, Information Technology — Gautam Buddha University
