// utils/formatCardOrders.ts
import { CardOrder } from '../../../shared/types';

export function formatCardOrders(cardOrders: CardOrder[]): string[] {
  return cardOrders.flatMap(co => {
    const unit = co.unit;
    if (!unit || !unit.order || !unit.nation || !unit.type || !unit.region) {
      return []; // skip invalid card orders
    }
    return [`${unit.nation}: ${unit.type} ${unit.region} ${unit.order.trim()}`];
  });
}