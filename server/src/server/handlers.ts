import { WebSocket } from 'ws';
import { Game } from '../game/Game';
import { CardOrder } from '../../../shared/types';

interface RegisterMessage {
  type: 'register';
  clientId: string;
}

interface SubmitOrdersMessage {
  type: 'submit_orders';
  clientId: string;
  nation: string;
  orders: string[];
}

interface SubmitCardOrdersMessage {
  type: 'submit_card_orders';
  clientId: string;
  cardOrders: CardOrder[];
}

interface SubmitRetreatsMessage {
  type: 'submit_retreats';
  clientId: string;
  nation: string;
  retreats: string[];
}

type Message = RegisterMessage | SubmitOrdersMessage | SubmitCardOrdersMessage;

export function handleRegister(
  msg: RegisterMessage,
  ws: WebSocket,
  clientMap: Map<string, WebSocket>,
  pushGameState: (ws: WebSocket) => void
): void {
  clientMap.set(msg.clientId, ws);
  console.log(`🆔 Registered client ${msg.clientId}`);
  pushGameState(ws);
}

export function handleSubmitOrders(
  msg: SubmitOrdersMessage,
  ws: WebSocket,
  game: Game,
  clientMap: Map<string, WebSocket>,
  broadcastGameState: () => void,
  pushGameState: (ws: WebSocket) => void
): void {

  if (game.getCurrentPhase().phase !== 'orders') {
    ws.send(JSON.stringify({ type: 'error', message: 'Cannot submit orders outside the orders phase.' }));
    return;
  }


  const { clientId, nation, orders } = msg;
  const error = game.validateOrders(nation, orders);

  if (error) {
    console.warn(`❌ Invalid orders from ${nation} - ${error}`);
    ws.send(JSON.stringify({ type: 'error', message: `Invalid order ${error}`, }));
    const clientWs = clientMap.get(clientId);
    if (clientWs) pushGameState(clientWs);
    return;
  }

  try {
    game.submitOrders(nation, orders);
    if (game.hasAllOrdersSubmitted()) {
      game.runPreMainPhase();
    }
    broadcastGameState();
  } catch (err) {
    console.error('❌ Order submission failed:', err);
    ws.send(JSON.stringify({ type: 'submit_result', success: false }));
  }
}

export function handleSubmitCardOrders(
  msg: SubmitCardOrdersMessage,
  ws: WebSocket,
  game: Game,
  broadcastGameState: () => void
): void {
  if (game.getCurrentPhase().phase !== 'card_orders') {
    ws.send(JSON.stringify({ type: 'error', message: 'Cannot submit card orders outside the orders phase.' }));
    return;
  }

  const { cardOrders } = msg;
  if (!Array.isArray(cardOrders)) {
      console.warn('⚠️ Malformed card order submission');
      return;
  }

  try {
    game.submitCardOrders(cardOrders);

    if (game.hasAllCardOrdersSubmitted()) {
      game.runCardOrders();
    }

    broadcastGameState();
  } catch (err) {
    console.error('❌ Card order submission failed:', err);
    ws.send(JSON.stringify({ type: 'submit_result', success: false }));
  }
}

export function handleSubmitRetreats(
  msg: SubmitRetreatsMessage,
  ws: WebSocket,
  game: Game,
  clientMap: Map<string, WebSocket>,
  broadcastGameState: () => void
): void {
  const { clientId, nation, retreats } = msg;

  try {
    game.submitRetreats(nation, retreats);
    if (game.hasAllRetreatsSubmitted()) {
      game.runRetreats();
    }
    broadcastGameState();
  } catch (err) {
    console.error('❌ Retreat submission failed:', err);
    ws.send(JSON.stringify({ type: 'submit_result', success: false }));
  }
}

