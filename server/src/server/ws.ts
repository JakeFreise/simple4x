import { WebSocketServer, WebSocket } from 'ws';
import { Game } from '../game/Game';
import { v4 as uuidv4 } from 'uuid';
import { handleRegister, handleSubmitOrders, handleSubmitRetreats, handleSubmitCardOrders} from './handlers';
const clientMap = new Map<string, WebSocket>();

export function setupWebSocket(server: import('http').Server, game: Game) {
  const wss = new WebSocketServer({ server });

  function pushGameState(ws: WebSocket) {
    const payload = JSON.stringify({ type: 'refresh' });
    ws.send(payload);
  }

  function broadcastGameState() {
    const payload = JSON.stringify({ type: 'refresh' });
    console.log(`📢 Broadcasting game state to ${clientMap.size} clients`);

    for (const ws of clientMap.values()) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }

  wss.on('connection', (ws) => {
    console.log('🟢 WebSocket client connected');

    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data.toString());
            console.log('message:', msg);

            switch (msg.type) {
            case 'register':
                handleRegister(msg, ws, clientMap, pushGameState);
                break;
            case 'submit_orders':
                handleSubmitOrders(msg, ws, game, clientMap, broadcastGameState, pushGameState);
                break;
            case 'submit_retreats':
                handleSubmitRetreats(msg, ws, game, clientMap, broadcastGameState);
                break;
            case 'submit_card_orders':
                handleSubmitCardOrders(msg, ws, game, broadcastGameState);
                break;
            default:
                console.warn('⚠️ Unknown message type:', msg.type);
                break;
            }
        } catch (e) {
            console.warn('⚠️ Invalid message from client', e);
        }
        });

    ws.on('close', () => {
        console.log('🔴 WebSocket client disconnected');
    });
  });
}
