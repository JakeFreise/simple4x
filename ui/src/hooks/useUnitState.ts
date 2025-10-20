import { useState } from 'react';
import { UnitSnapshot } from '../../../shared/types';

export function useUnitState(initialUnits: UnitSnapshot[] = []) {
  const [units, setUnits] = useState<UnitSnapshot[]>(initialUnits);

  const getUnitAt = (region: string): UnitSnapshot | undefined => {
    return units.find(u => u.region === region);
  };

  const updateUnitRegion = (region: string, newRegion: string) => {
    setUnits(prev =>
      prev.map(u => u.region === region ? { ...u, region: newRegion } : u)
    );
  };

  const resetUnits = () => {
    setUnits([]);
  };

  return {
    units,
    setUnits,
    getUnitAt,
    updateUnitRegion,
    resetUnits
  };
}
