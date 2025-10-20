import { UnitSnapshot } from '../../../shared/types';

/**
 * Validates a single unit order string.
 * Returns `null` if valid, or an error message if invalid.
 */
export function validateOrder(
  order: string,
  state: UnitSnapshot[]
): string | null {
  const match = order.match(/^([A-Z]{3}(?:_[A-Z]+)?):\s+(A|F)\s+([a-z]{3})\b/);
  if (!match) return `Invalid order syntax: ${order}`;

  const [_, orderNation, type, region] = match;

  const isMerc = orderNation.includes('_MERC');
  if (isMerc) return null; // Ghost units are assumed legal

  const unitExists = state.some(
    u => u.nation === orderNation && u.type === type && u.region === region
  );

  if (!unitExists) {
    return `No ${type} from ${orderNation} found in ${region}`;
  }

  return null;
}

export function prepareOrdersForAdjudicator(units: UnitSnapshot[]): string[] {
  return units.map(u => {
    const nation = u.nation;
    const type = u.type; // always A or F now
    const region = u.region;

    if (!u.order) return `${nation}: ${type} ${region} holds`;

    return u.order.replace(`${nation}: ${type} ${region}`, `${nation}: ${type} ${region}`);
  });
}

