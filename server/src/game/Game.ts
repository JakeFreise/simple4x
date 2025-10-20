import { UnitSnapshot, PlayerState, Phase, PhaseInfo, TurnPhaseKey, PhaseSnapshot, CardOrder} from '../../../shared/types';
import { Adjudicator } from '../adjudicator/Adjudicator';
import { validateOrder } from '../orders/OrderValidator';
import { CardEngine } from '../cards/CardEngine';
import { v4 as uuidv4 } from 'uuid';

export class Game {
  private state: UnitSnapshot[] = [];
  private currentPhase: PhaseInfo = { turn: 1, phase: 'orders' };
  private history: Record<TurnPhaseKey, PhaseSnapshot> = {};
  private adjudicator: Adjudicator;
  private cardEngine: CardEngine;
  private players: Record<string, PlayerState> = {};
  
  constructor() {
    this.players = {
      FRA: { nation: 'FRA', cards: { MERC: 1 } },
      ENG: { nation: 'ENG', cards: { MERC: 1, GOLD_BONUS: 1 } },
      GER: { nation: 'GER', cards: {} },
    };

    this.state = [...this.initialState()];
    this.history['0-orders_resolved'] = { units: this.cloneUnits(this.state) };
    this.adjudicator = new Adjudicator(this);
    this.cardEngine = new CardEngine(this);
  }

  private initialState(): UnitSnapshot[] {
    return [
      { nation: 'FRA', type: 'A', region: 'den',  id: uuidv4() },
      { nation: 'AUS', type: 'A', region: 'kie',  id: uuidv4() },
      { nation: 'TUR', type: 'A', region: 'swe',  id: uuidv4() },
    ];
  }

  private cloneUnits<T extends object>(units: T[]): T[] {
    return units.map(u => ({ ...u }));
  }

  private getPhaseKey(phase: Phase): TurnPhaseKey {
    return `${this.currentPhase.turn}-${phase}`;
  }

  public getPlayer(nation: string): PlayerState {
    const player = this.players[nation];
    if (!player) throw new Error(`Unknown player: ${nation}`);
    return player;
  }

  public getPlayers(): Record<string, PlayerState> {
    return this.players;
  }

  public getCurrentPhase(): PhaseInfo {
    return this.currentPhase;
  }

  public getHistory(): Record<TurnPhaseKey, PhaseSnapshot> {
    return this.history;
  }

  public getPhaseState(phase: Phase): UnitSnapshot[] | undefined {
    const key = this.getPhaseKey(phase);
    return this.history[key]?.units;
  }

  public getLatestSnapshot(): UnitSnapshot[] {
    const { turn } = this.currentPhase;
    const phasePriority: Phase[] = ['orders_resolved', 'retreats', 'orders', 'card_orders'];

    for (let t = turn; t >= 0; t--) {
      for (const phase of phasePriority) {
        const key = `${t}-${phase}` as TurnPhaseKey;
        const snapshot = this.history[key];
        if (snapshot) return snapshot.units;
      }
    }

    return [];
  }

  public getSubmittedNations(): Set<string> {
    return this.adjudicator.getSubmittedNations();
  }

  public hasAllOrdersSubmitted(): boolean {
    return this.adjudicator.hasAllOrders();
  }

  public hasAllCardOrdersSubmitted(): boolean {
    return this.cardEngine.hasAllOrders();
  }

  public hasAllRetreatsSubmitted(): boolean {
    return this.cardEngine.hasAllRetreats();
  }

  public submitOrders(nation: string, orders: string[]) {
    this.adjudicator.submitOrders(nation, orders);
  }

  public submitRetreats(nation: string, orders: string[]) {
    this.adjudicator.submitRetreats(nation, orders);
  }

  public addGhostUnit(unit: UnitSnapshot): UnitSnapshot {
    return this.adjudicator.addGhostUnit(unit); // better naming
  }

  public submitCardOrders(orders: CardOrder[]) {
    this.cardEngine.submitCardOrders(orders);
  }

  public injectOrder(nation: string, order: string) {
    this.adjudicator.injectOrder(nation, order);
  }

  public removeOrder(nation: string, region: string): void {
    this.adjudicator.removeOrder(nation, region);
  }

  private mergeAdjudicatedUnits(
    adjudicated: UnitSnapshot[],
    originalUnits: UnitSnapshot[]
  ): UnitSnapshot[] {
    const metaMap = new Map<string, UnitSnapshot>();

    for (const unit of originalUnits) {
      if (unit.id) {
        metaMap.set(unit.id, unit);
      }
    }

    return adjudicated.map((unit) => {
      const original = unit.id ? metaMap.get(unit.id) : undefined;

      return {
        ...unit,
        isGhost: original?.isGhost ?? false,
        tag: original?.tag,
      };
    });
  }

  public runRetreats(): void {
    const turn = this.getCurrentPhase().turn;
    const resolved = this.getHistory()[`${turn}-orders_resolved`]?.units ?? [];

    const { results, nextState } = this.adjudicator.adjudicateRetreats(resolved);

    this.savePhaseSnapshot(`${turn}-retreats`, results);
    this.savePhaseSnapshot(`${turn + 1}-orders`, nextState);
    this.setState(nextState);
    this.advancePhase('orders', 1);
  }

  public runMainPhase(snapshot: UnitSnapshot[]): void {
    const turn = this.getCurrentPhase().turn;
    const { state, hasRetreats } = this.adjudicator.prepareResolvedState(snapshot);

    this.setState(state);

    // Grab the original card orders
    const rawCardOrders = Object.values(this.cardEngine.getCardOrders()).flat();

    // Build a lookup map from snapshot
    const unitMap = new Map(snapshot.map(u => [u.id, u]));

    // Replace each cardOrder.unit with the updated unit from the snapshot
    const updatedCardOrders = rawCardOrders.map(cardOrder => {
      const id = cardOrder.unit?.id;
      if (!id) return cardOrder;

      const resolved = unitMap.get(id);
      if (!resolved) return cardOrder;

      return {
        ...cardOrder,
        unit: resolved,
      };
    });

    // Save the resolved state and resolved card orders
    this.savePhaseSnapshot(`${turn}-orders_resolved`, state, updatedCardOrders);

    this.cardEngine.clearCardOrders();

    if (hasRetreats) {
      this.advancePhase('retreats');
    } else {
      this.advancePhase('orders', 1);
    }
  }

  public runPreMainPhase(): void {
    const turn = this.getCurrentPhase().turn;
    const snapshot = this.adjudicator.adjudicate(false);

    this.history[`${turn}-orders`] = {
      units: this.cloneUnits(snapshot),
    };
    this.advancePhase('card_orders');
  }

  public runCardOrders(): void {
    const turn = this.getCurrentPhase().turn;

    const cardOrders = Object.values(this.cardEngine.getCardOrders()).flat();

    const snapshot = this.mergeAdjudicatedUnits(
      this.adjudicator.adjudicate(false),
      this.state
    );

    this.savePhaseSnapshot(`${turn}-card_orders`, snapshot, cardOrders); 

    this.cardEngine.applyCardOrders();

    const fullSnapshot = this.mergeAdjudicatedUnits(
      this.adjudicator.adjudicate(false),
      this.state
    );

    this.runMainPhase(fullSnapshot); 
  }


  public validateOrders(nation: string, orders: string[]): string | null {
    for (const order of orders) {
      const result = validateOrder(order, this.state);
      if (result !== null) return result;
    }
    return null;
  }

  public savePhaseSnapshot(
    label: TurnPhaseKey,
    units: UnitSnapshot[],
    cardOrders: CardOrder[] = []
  ): void {
    this.history[label] = {
      units: this.cloneUnits(units),
      ...(cardOrders.length > 0 ? { cardOrders: this.cloneUnits(cardOrders) } : {}),
    };
  }

  public getState(): UnitSnapshot[] {
    return this.state;
  }

  public setState(units: UnitSnapshot[]) {
    this.state = this.cloneUnits(units);
  }

  public advancePhase(next: Phase, turnIncrement = 0) {
    this.currentPhase = {
      turn: this.currentPhase.turn + turnIncrement,
      phase: next,
    };
  }

  public reset() {
    this.state = [...this.initialState()];
    this.currentPhase = { turn: 1, phase: 'orders' };
    this.history = {};
    this.adjudicator.clearSubmissions();
    this.history['0-orders_resolved'] = { units: this.cloneUnits(this.state) };
  }
}
