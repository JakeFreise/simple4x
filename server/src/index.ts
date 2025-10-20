import express from 'express';
import cors from 'cors';
import http from 'http';
import { Game } from './game/Game';
import { setupWebSocket } from './server/ws';
import { setupApiRoutes } from './server/api';

const app = express();
const port = 3000;
const server = http.createServer(app);

const game = new Game();

// Middleware
app.use(cors());
app.use(express.json());

// Setup API routes
setupApiRoutes(app, game);

// Setup WebSocket
setupWebSocket(server, game);

// Start server
server.listen(port, () => {
  console.log(`✅ Server + WS running at http://localhost:${port}`);
});
