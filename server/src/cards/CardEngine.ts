import { Game } from '../game/Game';
import { UnitSnapshot, CardOrder } from '../../../shared/types';
import { CardRegistry } from './cardHandlers';

export class CardEngine {
  private cardOrdersByNation: Record<string, CardOrder[]> = {};
  private submittedCardNations: Set<string> = new Set();

  constructor(private game: Game) {}

  public getCardOrders(): Record<string, CardOrder[]> {
    return this.cardOrdersByNation;
  }


  public getSubmittedNations(): Set<string> {
    return this.submittedCardNations;
  }

  public hasAllOrders(): boolean{
    return true
  }

  public hasAllRetreats(): boolean{
    return true
  }

  public addGhostUnit(unit: UnitSnapshot): void {
    // Inject the unit into the adjudicator
    this.game.addGhostUnit(unit);

    // Use provided order if available, otherwise default to "holds"
    const order = unit.order ?? `${unit.nation}: ${unit.type} ${unit.region} holds`;
    this.game.injectOrder(unit.nation, order);
  }

  public submitCardOrders(orders: CardOrder[]): void {
    for (const order of orders) {
      const { nation } = order;
      if (!this.cardOrdersByNation[nation]) {
        this.cardOrdersByNation[nation] = [];
      }
      this.cardOrdersByNation[nation].push(order);
      this.submittedCardNations.add(nation);
    }
  }

  public clearCardOrders(): void {
    this.cardOrdersByNation = {};
    this.submittedCardNations.clear();
  }

  public applyCardOrders(): void {
    for (const nation of Object.keys(this.cardOrdersByNation)) {
      const orders = this.cardOrdersByNation[nation];
      for (const order of orders) {
        const handler = CardRegistry[order.cardType];
        if (!handler) {
          console.warn(`⚠️ Unknown card type '${order.cardType}' — skipping`);
          continue;
        }

        try {
          handler(order, this.game);
        } catch (err) {
          console.error(`❌ Error applying card '${order.cardType}':`, err);
        }
      }
    }
  }
}
