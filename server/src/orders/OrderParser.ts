export interface ParsedOrder {
  nation: string;
  type: 'A' | 'F';
  from: string;
  command: 'hold' | 'move' | 'support' | 'convoy' | 'disband';
  to?: string;
  supportFrom?: string;
}

export function parseRetreatOrders(orderStrings: string[]): Record<string, string> {
  const map: Record<string, string> = {};

  for (const text of orderStrings) {
    const parsed = parseOrder(text);
    if (!parsed) continue;

    const key = `${parsed.nation}: ${parsed.type} ${parsed.from}`;

    if (parsed.command === 'move' && parsed.to) {
      // Retreat-style move: "ENG: A par -> bre"
      map[key] = parsed.to;
    } else if (parsed.command === 'disband') {
      // Explicit disband: "ENG: A par disbands"
      map[key] = 'disbands';
    } else if (parsed.command === 'hold') {
      // 'holds' is treated as no retreat — also results in disband
      map[key] = 'disbands';
    }
  }

  return map;
}

/**
 * Parses a unit order string into a structured object.
 */
export function parseOrder(order: string): ParsedOrder | null {
  // Example: "ENG: A lon -> bel"
  const moveMatch = order.match(/^([A-Z]{3}):\s+(A|F)\s+([a-z]{3})\s+->\s+([a-z]{3})$/);
  if (moveMatch) {
    const [, nation, type, from, to] = moveMatch;
    return { nation, type: type as 'A' | 'F', from, to, command: 'move' };
  }

  const holdMatch = order.match(/^([A-Z]{3}):\s+(A|F)\s+([a-z]{3})\s+holds$/);
  if (holdMatch) {
    const [, nation, type, from] = holdMatch;
    return { nation, type: type as 'A' | 'F', from, command: 'hold' };
  }

  // Add support, convoy, and more cases here as needed

  return null;
}

