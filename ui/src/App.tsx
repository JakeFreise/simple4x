import './App.css';
import { v4 as uuidv4 } from 'uuid';
import { useState, useEffect, useRef } from 'react';

import { CardOrder, UnitSnapshot, PhaseInfo, Phase } from '../../shared/types';

import { formatCardOrders } from './game/utils'; // optional helper

import MapView from './components/MapView';
import CardOrderPanel from './components/CardOrderPanel';

import { useMapInteraction } from './hooks/useMapInteraction';
import { useOrderState } from './hooks/useOrderState';
import { useUnitState } from './hooks/useUnitState';
import { useCardOrderState } from './hooks/useCardOrderState';

interface PhaseData {
  currentPhase: { turn: number; phase: string };
  fullState: UnitSnapshot[];
  orders: string[];
  units?: UnitSnapshot[];
  cardOrders?: CardOrder[];
}

const CLIENT_ID_KEY = 'diplomacy-client-id';
const phaseOrder = ['orders', 'card_orders', 'orders_resolved', 'retreats'];

function getClientId() {
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

function connectWebSocket(clientId, onRefresh, onSubmitResult, retryDelay = 1000) {
  const ws = new WebSocket('ws://localhost:3000');

  ws.onopen = () => {
    console.log('✅ WebSocket connected');
    ws.send(JSON.stringify({ type: 'register', clientId }));
  };

  ws.onmessage = (event) => {
    let msg;
    try {
      msg = JSON.parse(event.data);
      console.log('📨 WS message:', msg);
    } catch (err) {
      console.warn('⚠️ Invalid WS message:', event.data, err);
      return;
    }

    if (msg.type === 'refresh' && onRefresh) {
      onRefresh();
    } else if (msg.type === 'submit_result' && onSubmitResult) {
      onSubmitResult(msg);
    }
  };

  ws.onclose = () => {
    console.warn('🔁 WS closed. Retrying in', retryDelay, 'ms');
    setTimeout(() => connectWebSocket(clientId, onRefresh, onSubmitResult, retryDelay), retryDelay);
  };

  ws.onerror = (err) => {
    console.error('❌ WS error', err);
    ws.close();
  };

  return ws;
}

export default function App() {
  const clientId = getClientId();
  const wsRef = useRef<WebSocket | null>(null);
  const latestPhaseKeyRef = useRef<string | null>(null);

  const { units, setUnits, getUnitAt, resetUnits } = useUnitState();
  const { orders, setOrder, resetOrders, resetRetreats } = useOrderState();
  const { cardOrders, setCardOrders, addCardOrder, removeCardOrderAt, resetCardOrders } = useCardOrderState();

  const [stateHistory, setStateHistory] = useState<Map<string, PhaseData>>(new Map());
  const [currentPhaseKey, setCurrentPhaseKey] = useState<string | null>(null);

  const makePhaseKey = (phaseObj: PhaseInfo): string => `${phaseObj.turn}-${phaseObj.phase}`;
  function parsePhaseKey(key: string): PhaseInfo {
    const [turnStr, phase] = key.split('-');
    return {
      turn: parseInt(turnStr, 10),
      phase: phase as Phase,
    };
  }

  const fetchState = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/state');
      const state = await res.json();
      const phaseKey = makePhaseKey(state.currentPhase);
      latestPhaseKeyRef.current = phaseKey;

      const updated = new Map();
      const historyEntries = Object.entries(state.history as Record<string, PhaseData>);
      for (const [key, value] of historyEntries) {
        const units = value.units || [];
        const orders = units.map((u) => u.order).filter(Boolean);
        const cardOrders = (value as any).cardOrders ?? [];
        updated.set(key, {
          currentPhase: parsePhaseKey(key),
          fullState: units,
          orders,
          cardOrders,
        });
      }

      const latestUnits = state.fullState || [];
      updated.set(phaseKey, {
        currentPhase: state.currentPhase,
        fullState: latestUnits,
        orders: [],
      });

      setStateHistory(updated);
      setCurrentPhaseKey(phaseKey);

      const phase = state.currentPhase.phase;
      const ghostUnits =
        phase === 'card_orders'
          ? state.cardOrders?.map(c => c.unit).filter((u): u is UnitSnapshot => !!u && u.isGhost) ?? []
          : [];

      setUnits([...latestUnits, ...ghostUnits]);

      if (phase === 'retreats') {
        resetRetreats(latestUnits);
      } else if (phase === 'card_orders') {
        resetCardOrders();
      } else {
        resetOrders(latestUnits);
      }
      // Clear ghost units unless we're still in card_orders phase
      if (phase !== 'card_orders') {
        resetGhosts();
      }
    } catch (err) {
      console.error('❌ Failed to parse state:', err);
    }
  };

  useEffect(() => {
    fetchState();
    wsRef.current = connectWebSocket(clientId, fetchState, handleSubmitResult);
  }, []);

  const handleSubmitResult = (msg) => console.log('✅ Submit result received', msg);

  const currentState = currentPhaseKey ? stateHistory.get(currentPhaseKey) : null;

  useEffect(() => {
    if (currentState?.fullState) {
      const ghostUnits =
        currentState.cardOrders?.map((co) => co.unit).filter((u): u is UnitSnapshot => Boolean(u?.isGhost)) ?? [];
      setUnits([...currentState.fullState, ...ghostUnits]);
    }
  }, [currentPhaseKey, currentState, setUnits]);

  const handleIssuedOrder = (unit: UnitSnapshot, order: string) => {
    const isCardPhase = currentState?.currentPhase.phase === 'card_orders';
    const isGhost = unit.isGhost;

    if (isCardPhase && isGhost) {
      setCardOrders((prev) => {
        const updated = prev.filter(c => c.unit?.region !== unit.region);
        updated.push({
          nation: unit.nation,
          cardType: 'MERCENARY',
          unit: { ...unit, order },
        });
        return updated;
      });
    } else {
      setOrder(order);
    }
  };

  const {
    selectedRegion,
    selectedUnit,
    supportStep,
    supportUnitRegion,
    orderMode,
    handleSetOrderMode,
    handleRegionClick,
    selectCard,
    cancelGhost,
    ghostUnits,
    resetGhosts,
  } = useMapInteraction(units, getUnitAt, currentState?.currentPhase, handleIssuedOrder);

  const submitOrders = () => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({
      type: 'submit_orders',
      nation: 'FRA',
      orders,
      clientId,
    }));
  };

  const submitCardOrders = () => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({
      type: 'submit_card_orders',
      nation: 'FRA',
      cardOrders,
      clientId,
    }));
    resetCardOrders();
  };
  
  
  const sortedPhaseKeys = Array.from(stateHistory.keys()).sort((a, b) => {
    const [turnA, phaseA] = a.split('-');
    const [turnB, phaseB] = b.split('-');
    return Number(turnA) - Number(turnB) || phaseOrder.indexOf(phaseA) - phaseOrder.indexOf(phaseB);
  });

  const currentIndex = currentPhaseKey ? sortedPhaseKeys.indexOf(currentPhaseKey) : -1;
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < sortedPhaseKeys.length - 1;

  const goToPhase = (index: number) => {
    const key = sortedPhaseKeys[index];
    const newState = stateHistory.get(key);
    if (!newState) return;

    setCurrentPhaseKey(key);
    resetUnits();

    const baseUnits = [...newState.fullState];
    const isCardPhase = newState.currentPhase.phase === 'card_orders';
    if (!isCardPhase) {
      resetGhosts();
    }

    const ghostUnits =
      isCardPhase
        ? newState.cardOrders?.map((co) => co.unit).filter((u): u is UnitSnapshot => Boolean(u?.isGhost)) ?? []
        : [];

    setUnits([...baseUnits, ...ghostUnits]);

    const isLatest = key === latestPhaseKeyRef.current;
    const phase = newState.currentPhase.phase;

    if (isLatest) {
      if (phase === 'card_orders') {
        resetOrders([]);
        const previousKey = sortedPhaseKeys[index - 1];
        const previousState = stateHistory.get(previousKey);
        previousState?.orders.forEach(setOrder);
        setCardOrders(newState.cardOrders ?? []);
      } else if (phase === 'retreats') {
        resetRetreats(newState.fullState);
      } else {
        resetOrders(newState.fullState);
      }
    } else {
      resetOrders([]);
      newState.orders?.forEach(setOrder);
      setCardOrders(newState.cardOrders ?? []);
    }
  };

  const safeCardOrders = currentState?.currentPhase.phase === 'card_orders' ? cardOrders : currentState?.cardOrders ?? [];
  const currentPhaseInfo = currentPhaseKey ? parsePhaseKey(currentPhaseKey) : null;
  const currentPhaseName = currentPhaseInfo?.phase ?? 'orders'; // fallback
  // Extract string-based orders for overlay display
  const extractedCardOrderStrings = formatCardOrders(safeCardOrders);
  console.log(orders);
  return (
    <div className="app-wrapper">
      <div className="map-area">
        <div className="map-header">
          <span>
            Turn {currentState?.currentPhase?.turn ?? '–'} — {currentState?.currentPhase?.phase?.toUpperCase() ?? '–'}
          </span>
          <div>
            <button disabled={!canGoBack} onClick={() => goToPhase(currentIndex - 1)}>{'←'}</button>
            <button disabled={!canGoForward} onClick={() => goToPhase(currentIndex + 1)}>{'→'}</button>
          </div>
        </div>

        <div className="map-content">
          <MapView
            selectedRegion={selectedRegion}
            supportStep={supportStep}
            supportUnitRegion={supportUnitRegion}
            onRegionClick={handleRegionClick}
            units={[...units, ...ghostUnits]}
            phase={currentPhaseName}
            orders={orders}
            cardOrders={extractedCardOrderStrings}
          />
        </div>

        <div className="map-footer">
          <div>
            {selectedUnit
              ? `${selectedUnit.nation} ${selectedUnit.type} in ${selectedUnit.region.toUpperCase()}`
              : 'Select a unit to issue orders'}
          </div>
          <div style={{ marginTop: '4px' }}>
            <button className={orderMode === 'hold' ? 'active' : ''} disabled={!selectedUnit} onClick={() => handleSetOrderMode('hold')}>Hold</button>
            <button className={orderMode === 'move' ? 'active' : ''} disabled={!selectedUnit} onClick={() => handleSetOrderMode('move')}>Move</button>
            <button className={orderMode === 'support' ? 'active' : ''} disabled={!selectedUnit} onClick={() => handleSetOrderMode('support')}>Support</button>
          </div>
          <div style={{ marginTop: '12px' }}>
            <button onClick={submitOrders}>Submit Orders</button>
            {currentState?.currentPhase.phase === 'card_orders' && (
              <button onClick={submitCardOrders} style={{ marginLeft: '8px' }}>Submit Card Orders</button>
            )}
          </div>
        </div>
      </div>

      <div className="player-info">
        <h3>🏅 Player Info</h3>
        <ul>
          <li>Argentina: VP 3 • Wheat: 2 • Units: 4</li>
          <li>Japan: VP 2 • Ore: 1 • Units: 3</li>
        </ul>
      </div>

      <div className="order-summary">
        <h3>📝 Orders</h3>

        <div>
          <strong>Main Orders</strong>
          <pre>{orders.join('\n') || '—'}</pre>
        </div>

      {safeCardOrders.length > 0 && (
        <div>
          <strong>Card Orders</strong>
          <pre>
            {safeCardOrders.map((o) => {
              const base = `${o.nation} ${o.cardType.toUpperCase()}`;
              if (o.unit?.order) {
                return `${base} - ${o.unit.order}`;
              }
              if (o.unit) {
                return `${base} - ${o.unit.type} ${o.unit.region.toUpperCase()}`;
              }
              return base;
            }).join('\n')}
          </pre>
        </div>
      )}
      </div>

      <div className="chat-trade-panel">
        <h3>💬 Chat & Trade</h3>
        <div className="chat-box">
          <p><strong>Japan:</strong> Let's trade wheat!</p>
        </div>
        <button>Send Trade Request</button>
      </div>

      <div className="card-hand">
        <h3>🃏 Your Cards</h3>
        <div className="card">Sabotage</div>
        <div className="card">Trade Boost</div>
        <div className="card" onClick={() => selectCard('MERCENARY', 'FRA')} style={{ cursor: 'pointer' }}>
          Reinforcements
        </div>
      </div>
    </div>
  );
}
