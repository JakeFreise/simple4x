import { UnitSnapshot } from '../../../shared/types';

export function prepareOrdersForAdjudicator(units: UnitSnapshot[]): string[] {
  return units.map(u => {
    const nation = u.nation;
    const type = u.type; // always A or F now
    const region = u.region;

    if (!u.order) return `${nation}: ${type} ${region} holds`;

    return u.order.replace(`${nation}: ${type} ${region}`, `${nation}: ${type} ${region}`);
  });
}
