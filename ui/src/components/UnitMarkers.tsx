import { getUnitPosition, tileMap } from '../game/tiles';
import { UnitSnapshot } from '../../../shared/types';

interface UnitMarkersProps {
  units: UnitSnapshot[];
}

export default function UnitMarkers({ units }: UnitMarkersProps) {
  return (
    <>
      {units.map((unit) => {
        const pos = getUnitPosition(unit.region);
        if (!pos) return null;

        const { x: cx, y: cy } = pos;
        const size = 10;

        const fillColor =
          unit.nation === 'FRA' ? 'blue' :
          unit.nation === 'ENG' ? 'red' :
          unit.nation === 'GER' ? 'black' : 'gray';

        const isMerc = unit.tag?.includes('MERC');

        return (
          <g key={`${unit.nation}-${unit.region}`}>
            {unit.type === 'A' ? (
              // Army = circle
              <circle
                cx={cx}
                cy={cy}
                r={size}
                fill={fillColor}
                stroke="black"
                strokeWidth={2}
              />
            ) : (
              // Fleet = upside-down triangle
              <polygon
                points={`
                  ${cx},${cy + size}
                  ${cx - size},${cy - size}
                  ${cx + size},${cy - size}
                `}
                fill={fillColor}
                stroke="black"
                strokeWidth={2}
              />
            )}
            {isMerc && (
              <text
                x={cx}
                y={cy + 4}
                textAnchor="middle"
                fontSize="16"
                fontWeight="bold"
                fill="white"
              >
                /
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}
