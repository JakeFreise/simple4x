import { tiles, getTileCenter, getTileTextAnchor } from '../game/tiles';
import UnitMarkers from './UnitMarkers';
import OrderOverlays from './OrderOverlays';
import { UnitSnapshot } from '../../../shared/types';

interface MapViewProps {
  selectedRegion: string | null;
  supportStep: number;
  supportUnitRegion: string | null;
  onRegionClick: (region: string) => void;
  units: UnitSnapshot[];
  phase: string;
  orders: string[];
  cardOrders?: string[];           // ✅ Add this
}

export default function MapView({
  selectedRegion,
  supportStep,
  supportUnitRegion,
  onRegionClick,
  units,
  phase,
  orders,
  cardOrders = []               // ✅ Default empty if not provided
}: MapViewProps) {
  const issuedOrders =
  phase === 'card_orders' ? [...orders, ...cardOrders] : orders;
  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox="0 0 3500 2650"
        width="100%"
        style={{ height: '100vh', background: '#ddeeff' }}
      >
        {/* Draw tiles as polygons */}
        {tiles.map((tile) => {
          const points = tile.polygon.map(p => `${p.x},${p.y}`).join(' ');
          const name_position = tile.labelPosition ?? getTileTextAnchor(tile);
          const label = tile.region.toUpperCase();

          const fillColor =
            tile.type === 'sea'
              ? '#a0b9cc' // sea = blue-grey
              : '#e8d4a2'; // land (and coast) = light tan

          return (
            <g key={tile.region} onClick={() => onRegionClick(tile.region)}>
              <polygon
                points={points}
                fill={fillColor}
                stroke="black"
                strokeWidth={1}
              />
              <text
                x={name_position.x}
                y={name_position.y}
                fontSize="32"
                textAnchor="middle"
                pointerEvents="none"
              >
                {label}
              </text>
            </g>
          );
        })}
        {/* Draw overlays and units */}
        <OrderOverlays units={units} phase={phase} issuedOrders={issuedOrders} />
        <UnitMarkers units={units} />
      </svg>
    </div>
  );
}
