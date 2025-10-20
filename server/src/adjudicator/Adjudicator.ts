import diplomacy from '../../../pkg';
import { Game } from '../game/Game';
import { UnitSnapshot } from '../../../shared/types';
import { v4 as uuidv4 } from 'uuid';

interface AdjudicatorResult {
  unit: string;
  order: string;
  succeeded: boolean;
  dislodged_by: string | null;
  retreat_options: string[];
  explanation: string;
  new_position: string;
}

export class Adjudicator {
  private ordersByNation: Record<string, string[]> = {};
  private submittedNations: Set<string> = new Set();

  constructor(private game: Game) {}

  private makeUnitKey(nation: string, type: string, region: string): string {
    return `${nation}:${type}:${region}`.toLowerCase();
  }

  public getOrdersByNation(): Record<string, string[]> {
    return this.ordersByNation;
  }

  public getSubmittedNations(): Set<string>{
    return this.submittedNations;
  }

  public submitOrders(nation: string, orders: string[]) {
    this.ordersByNation[nation] = orders;
    this.submittedNations.add(nation);
  }

  public submitRetreats(nation: string, orders: string[]) {
    this.ordersByNation[nation] = orders;
    this.submittedNations.add(nation);
  }

  public injectOrder(nation: string, order: string): void {
    if (!this.ordersByNation[nation]) {
      this.ordersByNation[nation] = [];
    }
    this.ordersByNation[nation].push(order);
  }

  public removeOrder(nation: string, region: string): void {
    const orders = this.ordersByNation[nation];
    if (!orders) return;

    this.ordersByNation[nation] = orders.filter(order => {
      return !order.includes(` ${region}`);
    });
  }

  public hasAllOrders(): boolean {
    return true;
  }

  public clearSubmissions() {
    this.ordersByNation = {};
    this.submittedNations.clear();
  }

  public adjudicate(useNewPosition = true): UnitSnapshot[] {
    const orders = Object.values(this.getOrdersByNation()).flat();
    const results: AdjudicatorResult[] = diplomacy.adjudicate_with_input(orders).unit_results;

    // Build a map of original units by (nation, type, region)
    const state = this.game.getState();
    const idMap = new Map<string, string>();
    for (const unit of state) {
      const key = this.makeUnitKey(unit.nation, unit.type, unit.region);
      idMap.set(key, unit.id);
    }

    // Map results and reattach IDs
    return results.map(r => this.mapAdjudicatorResult(r, useNewPosition, idMap));
  }


  public addGhostUnit(unit: UnitSnapshot): UnitSnapshot {
    const ghost: UnitSnapshot = {
      ...unit,
      status: 'ok',
      isGhost: true,
      tag: 'MERC',
      id: uuidv4(),
    };

    const updatedUnits = [...this.game.getState(), ghost];
    this.game.setState(updatedUnits);
    console.log("Added Ghost unit", updatedUnits);
    if (ghost.order) {
      this.injectOrder(ghost.nation, ghost.order);
    }

    console.log(`📦 Spawned MERC unit for ${unit.nation} in ${unit.region}`);
    return ghost;
  }
  
  public filterOutGhosts(units: UnitSnapshot[]): UnitSnapshot[] {
    return units.filter(u => !u.isGhost);
  }

  public prepareResolvedState(snapshot: UnitSnapshot[]): {
    state: UnitSnapshot[],
    hasRetreats: boolean
  } {
    let hasRetreats = false;
    const state: UnitSnapshot[] = [];

    for (const unit of snapshot) {
      if (unit.isGhost) continue;

      const finalUnit = { ...unit };

      if (finalUnit.status === 'dislodged') {
        hasRetreats = true;
        // stay in place
      } else if (finalUnit.succeeded && finalUnit.order?.includes('->')) {
        // Extract destination from order string
        const match = finalUnit.order.match(/->\s*(\w+)/);
        if (match) {
          finalUnit.region = match[1];
        }
      }

      state.push(finalUnit);
    }

    return { state, hasRetreats };
  }

  public adjudicateRetreats(
    dislodgedUnits: UnitSnapshot[]
  ): { results: UnitSnapshot[]; nextState: UnitSnapshot[] } {
    const retreatOrders: Record<string, string> = Object.fromEntries(
      Object.entries(this.ordersByNation)
        .flatMap(([_, orders]) => orders)
        .map(order => {
          const [nation, type, region] = order.split(' ');
          const dest = order.split('->')[1]?.trim() ?? 'disbands';
          return [`${nation}: ${type} ${region}`, dest];
        })
    );

    const retreatResults: UnitSnapshot[] = [];
    const nextState: UnitSnapshot[] = [];

    for (const unit of dislodgedUnits) {
      if (!unit.isGhost) continue;

      const key = `${unit.nation}: ${unit.type} ${unit.region}`;
      const dest = retreatOrders[key];
      const legalOptions = unit.retreat_options ?? [];

      let succeeded = false;
      let explanation = '';
      let finalRegion = 'DISBANDED';
      let status: UnitSnapshot['status'] = 'disbanded';

      if (unit.status !== 'dislodged') {
        retreatResults.push({ ...unit });
        nextState.push({ ...unit });
        continue;
      }

      if (!dest || dest === 'disbands') {
        explanation = 'Disbanded (no order or chosen)';
      } else if (!legalOptions.includes(dest)) {
        explanation = `Illegal retreat to ${dest}. Disbanded instead.`;
      } else {
        succeeded = true;
        explanation = `Retreated to ${dest}`;
        finalRegion = dest;
        status = 'ok';
      }

      retreatResults.push({
        ...unit,
        region: finalRegion,
        status,
        order: dest === 'disbands' ? `${key} disbands` : `${key} -> ${dest}`,
        succeeded,
        explanation,
      });

      if (succeeded) {
        nextState.push({
          id: unit.id,
          nation: unit.nation,
          type: unit.type,
          region: dest,
          status: 'ok',
        });
      }
    }
    return { results: retreatResults, nextState };
  }

  private mapAdjudicatorResult(
    result: AdjudicatorResult,
    useNewPosition: boolean,
    idMap: Map<string, string>
  ): UnitSnapshot {
    const [nation, type, from] = result.unit.split(' ');
    const key = this.makeUnitKey(nation, type, from);
    const id = idMap.get(key) ?? uuidv4(); // fallback in case it's missing

    return {
      id,
      nation,
      type: type as 'A' | 'F',
      region: useNewPosition ? result.new_position : from,
      order: result.order,
      succeeded: result.succeeded,
      dislodged_by: result.dislodged_by,
      retreat_options: result.retreat_options,
      explanation: result.explanation,
      status: result.dislodged_by ? 'dislodged' : 'ok',
    };
  }
}
