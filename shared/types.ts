//
// === UNIT TYPES ===
//
export interface Unit {
  id: string;
  nation: string;       // e.g. "FRA"
  type: 'A' | 'F';       // For adjudication and validation
  region: string;        // e.g. "par"
}

export interface UnitSnapshot extends Unit {
  order?: string;
  status?: 'ok' | 'dislodged' | 'disbanded';
  succeeded?: boolean;
  dislodged_by?: string | null;
  retreat_options?: string[];
  explanation?: string;

  isGhost?: boolean;     // was spawned by a card
  tag?: string;          // e.g., "MERC", "PIRATE"
}

//
// === PLAYER STATE ===
//

export interface PlayerState {
  nation: string;
  cards: Record<string, number>; // Card type → count
  gold?: number;                 // For economy phase
  vp?: number;                   // Victory points
  // Future: tech, builds, influence, structures
}

//
// === CARD ORDERS ===
//

export interface CardOrder {
  nation: string;
  cardType: string;
  metadata?: Record<string, any>;   // Card-specific info (e.g. region, amount)
  unit?: UnitSnapshot;              // Optional ghost or affected unit
}

//
// === TURN STATE ===
//

export type Phase = 'orders' | 'card_orders' | 'retreats' | 'orders_resolved';

export interface PhaseInfo {
  turn: number;
  phase: Phase;
}

export type TurnPhaseKey = `${number}-${Phase}`;

export interface PhaseSnapshot {
  units: UnitSnapshot[];
  cardOrders?: CardOrder[]; 
}
