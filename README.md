# Google Chat DOM Extract

A lightweight Chrome extension + local Node.js bridge that watches Google Chat messages, extracts text from the DOM, and forwards trigger messages to a local WebSocket server powered by Google Gemini.

This project is designed to let a browser extension interact with Google Chat content and send selected messages to an AI service or scripted response handler.

## Overview

The repository has two main parts:

- `extension/` — a Chrome extension that monitors Google Chat pages and sends selected chat messages to a local WebSocket server.
- `chat-server/` — a Node.js server that listens for incoming messages and responds with built-in commands or Gemini-generated text.

## Features

- Monitors Google Chat DOM for new messages
- Detects trigger phrases such as:
  - `#bot`
  - `#geek1`
  - `!spam`
- Sends the message payload to a local WebSocket server
- Uses Google Gemini via the `@google/genai` SDK for AI responses
- Injects generated replies back into the active Google Chat composer
- Works as a local development bridge without requiring a public backend

## Architecture

```text
Google Chat page
      │
      ▼
Chrome extension
  - content script scans DOM
  - popup starts the bridge
  - service worker manages WebSocket connection
      │
      ▼
ws://127.0.0.1:8765
      │
      ▼
Node.js server (chat-server/server.js)
  - handles chat_message events
  - triggers built-in responses
  - calls Gemini API for AI replies
      │
      ▼
Reply sent back into Google Chat
```

## Repository Structure

```text
.
├── LICENSE
├── README.md
├── chat-server/
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
└── extension/
    ├── content.js
    ├── manifest.json
    ├── popup.html
    ├── popup.js
    └── service-worker.js
```

## Prerequisites

Before using the project, make sure you have:

- Node.js 18+ installed
- npm installed
- A Google API key for Gemini access
- Google Chrome or Chromium with developer mode enabled

## Setup

### 1) Configure the Node server

```bash
cd chat-server
npm install
```

Create a `.env` file in `chat-server/`:

```env
GEMINI_API_KEY=your_api_key_here
```

Start the WebSocket server:

```bash
npm start
```

The server listens on:

```text
ws://127.0.0.1:8765
```

### 2) Load the browser extension

1. Open Chrome and go to `chrome://extensions`
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select the `extension/` folder in this repository
5. Open Google Chat in a browser tab
6. Click the extension popup and press `Start`

## How it works

### Trigger types

The extension monitors Google Chat messages for specific text triggers:

- `#bot`  
  Sends a simple built-in response: `Hello.`

- `#geek1 <prompt>`  
  Sends the text after the trigger to Gemini and returns the generated answer.

- `!spam <count> [text]`  
  Repeats the provided text the given number of times.

Example:

```text
#geek1 Explain how this bridge works in simple terms.
```

### Security and stability notes

This project depends on the current structure of Google Chat's DOM. If Google changes the page structure or class names, the selector-based DOM scanning may need to be updated.

The extension is intended for local, personal use and is not a production-grade deployment for browser automation or public services.

## Local development notes

- The WebSocket server is intentionally local-only and runs on `127.0.0.1`
- The browser extension requires a valid Google Chat tab and active permission to access the page
- If the server is not running, the extension will log connection errors but will not send replies

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Disclaimer

This project interacts with Google Chat DOM elements and sends requests to a local AI service. Use it responsibly and ensure that you comply with the terms of service and applicable policies for the tools and platforms it interacts with.
