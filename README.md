# WebSockets Chess Game

A real-time multiplayer chess game built with React (frontend), Express.js (backend), WebSockets. The app allows users to join a room and play chess against each other with live move synchronization.

## Features
- Real-time chess gameplay between two users
- Room-based matchmaking (join by room ID)
- Live move updates using WebSockets
- Modern React frontend styled with Tailwind CSS
- Chess logic powered by [chess.js](https://github.com/jhlywa/chess.js)

## Project Structure
```
WEBRTC/
├── backend/         # Express.js WebSocket server
│   ├── index.js
│   └── package.json
├── frontend/        # React + Vite client
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── pages/
│   │       ├── Home.jsx
│   │       └── Game.jsx
│   ├── public/
│   ├── index.html
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```sh
   cd backend
   npm install
   touch .env
   npm start
   ```
   The backend server will start on the port specified in your `.env` file (e.g., 8000). Here i have used the port 4000 for the backend websocketserver

### Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```sh
   cd frontend
   npm install
   npm run dev
   ```
   The React app will start (default: http://localhost:5173).

## Usage
1. Open the frontend in your browser.
2. Enter your name and a room ID on the home page.
3. Share the room ID with your opponent and both join the same room.
4. Play chess in real time!

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, react-chessboard, chess.js
- **Backend:** Express.js, ws (WebSockets), chess.js
