import React from 'react';
import { UnitSnapshot } from '../../../shared/types';
import { getUnitPosition, tileMap } from '../game/tiles';

interface OrderOverlaysProps {
  units: UnitSnapshot[];
  phase: string;
  issuedOrders?: string[];
}

const normalize = (region?: string) => region?.toLowerCase() ?? '';
const unitKey = (nation: string, type: string, region: string) =>
  `${nation}:${type}:${normalize(region)}`;

export default function OrderOverlays({
  units,
  phase,
  issuedOrders = [],
}: OrderOverlaysProps) {
  const showOutcome = phase === 'orders_resolved' || phase === 'retreats';
  const overlays: React.ReactElement[] = [];

  // Build order map
  const orderMap: Record<string, string> = {};
  for (const order of issuedOrders) {
    const match = order.match(/^(\w+):\s+(\w)\s+(\w+)/);
    if (!match) continue;
    const [, nation, type, region] = match;
    orderMap[unitKey(nation, type, region)] = order;
  }

  for (const unit of units) {
    const key = unitKey(unit.nation, unit.type, unit.region);
    const rawOrder = orderMap[key] || unit.order;
    if (!rawOrder) continue;

    const order = rawOrder.toUpperCase();
    const fromRegion = normalize(unit.region);
    const fromPos = getUnitPosition(fromRegion);
    if (!fromPos) continue;

    const color =
      showOutcome && unit.succeeded === false
        ? 'red'
        : order.includes('SUPPORTS')
        ? 'gray'
        : 'black';

    const { x: x1, y: y1 } = fromPos;

    if (order.includes('HOLD')) {
      overlays.push(
        <circle
          key={`hold-${unit.region}`}
          cx={x1}
          cy={y1}
          r={20}
          stroke={color}
          strokeWidth={4}
          fill="none"
        />
      );
    } else if (order.includes('SUPPORTS')) {
      const match = order.match(/SUPPORTS\s+(\w)\s+(\w+)(?:\s*->\s*(\w+))?/);
      if (!match) continue;

      const [, supportedType, supportFromRaw, supportToRaw] = match;
      const supportFrom = normalize(supportFromRaw);
      const supportTo = normalize(supportToRaw);

      const fromTile = getUnitPosition(supportFrom);
      const toTile = supportTo ? getUnitPosition(supportTo) : null;
      if (!fromTile) continue;

      const x2 = toTile
        ? (fromTile.x + toTile.x) / 2
        : fromTile.x;
      const y2 = toTile
        ? (fromTile.y + toTile.y) / 2
        : fromTile.y;

      overlays.push(
        <line
          key={`support-${unit.region}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth={2}
          strokeDasharray="4 4"
        />
      );
    } else if (order.includes('->')) {
      const toRegion = normalize(order.split('->')[1]?.trim());
      const toPos = getUnitPosition(toRegion);
      if (!toPos) continue;

      overlays.push(
        <line
          key={`move-${unit.region}-${toRegion}`}
          x1={x1}
          y1={y1}
          x2={toPos.x}
          y2={toPos.y}
          stroke={color}
          strokeWidth={3}
          markerEnd="url(#arrowhead)"
        />
      );
    }
  }

  return (
    <>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="black" />
        </marker>
      </defs>
      {overlays}
    </>
  );
}
