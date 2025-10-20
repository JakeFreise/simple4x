import { useState } from 'react';
import { UnitSnapshot } from '../../../shared/types';

export function useMapInteraction(units, getUnitAt, currentPhase, onOrderIssued) {
  const isCardOrderPhase = currentPhase?.phase === 'card_orders';
  const isRetreatPhase = currentPhase?.phase === 'retreats';
  const [retreatOptions, setRetreatOptions] = useState<string[]>([]);

  const [selectedUnit, setSelectedUnit] = useState<UnitSnapshot | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [orderMode, setOrderMode] = useState<'hold' | 'move' | 'support' | null>(null);

  const [supportStep, setSupportStep] = useState(0);
  const [supportUnitRegion, setSupportUnitRegion] = useState<string | null>(null);
  const [supportUnitType, setSupportUnitType] = useState<'A' | 'F' | null>(null);

  const [cardSpawnMode, setCardSpawnMode] = useState(false);
  const [cardSpawningNation, setCardSpawningNation] = useState<string | null>(null);

  const [ghostUnits, setGhostUnits] = useState<UnitSnapshot[]>([]); 

  function resetInteraction() {
    setSelectedUnit(null);
    setSelectedRegion(null);
    setOrderMode(null);
    setSupportStep(0);
    setSupportUnitRegion(null);
    setSupportUnitType(null);
  }

  function resetGhosts() {
    setGhostUnits([]);
  }

  function cancelGhost(region) {
    setGhostUnits(prev => prev.filter(u => u.region !== region));
    resetInteraction();
  }

  function selectCard(cardType, nation) {
    if (cardType === 'MERCENARY') {
      setCardSpawnMode(true);
      setCardSpawningNation(nation);
      resetInteraction();
    }
  }

  function handleSetOrderMode(mode) {
    setOrderMode(mode);

    if (mode === 'hold' && selectedUnit) {
      const { nation, type, region } = selectedUnit;
      const order = `${nation}: ${type} ${region} holds`;
      onOrderIssued?.(selectedUnit, order);
      resetInteraction();
    }
  }

  function handleRegionClick(region) {
    const allUnits = [...units, ...ghostUnits];
    const clickedUnit = allUnits.find(u => u.region === region);

    const isGhostHere = ghostUnits.some(u => u.region === region);
    const isGhostSelected =
      selectedUnit != null &&
      ghostUnits.some(u => u.region === selectedUnit.region && u.nation === selectedUnit.nation);

    if (isRetreatPhase) {
      if (!selectedUnit) {
        if (clickedUnit?.status === 'dislodged' && Array.isArray(clickedUnit.retreat_options)) {
          setSelectedUnit(clickedUnit);
          setSelectedRegion(region);
          setRetreatOptions(clickedUnit.retreat_options);
        }
        return;
      }

      const { nation, type, region: from } = selectedUnit;

      if (region === from) {
        onOrderIssued?.(selectedUnit, `${nation}: ${type} ${from} disbands`);
        resetInteraction();
        return;
      }

      if (retreatOptions.includes(region)) {
        onOrderIssued?.(selectedUnit, `${nation}: ${type} ${from} -> ${region}`);
        resetInteraction();
        return;
      }
      return;
    }

    if (isCardOrderPhase && !cardSpawnMode && !isGhostHere && !isGhostSelected) {
      return;
    }

    if (cardSpawnMode) {
      const existingGhost = ghostUnits.find(u => u.region === region);
      if (clickedUnit && !existingGhost) return;

      if (existingGhost) {
        setSelectedUnit(existingGhost);
        setSelectedRegion(region);
        setCardSpawnMode(false);
        setCardSpawningNation(null);
        return;
      }

      const nation = cardSpawningNation!;
      const newUnit: UnitSnapshot = {
        nation,
        type: 'A', // fallback to 'A' for compatibility with adjudicator
        region,
        isGhost: true,
        tag: 'MERC'
      };
      setGhostUnits(prev => [...prev, newUnit]);
      setSelectedUnit(newUnit);
      setSelectedRegion(region);
      setCardSpawnMode(false);
      setCardSpawningNation(null);
      return;
    }

    if (!selectedUnit) {
      if (clickedUnit) {
        setSelectedUnit(clickedUnit);
        setSelectedRegion(region);
      }
      return;
    }

    if (!orderMode) {
      const { nation, type, region: from } = selectedUnit;
      const order = region === from
        ? `${nation}: ${type} ${from} holds`
        : `${nation}: ${type} ${from} -> ${region}`;
      onOrderIssued?.(selectedUnit, order);
      resetInteraction();
      return;
    }

    if (!clickedUnit && orderMode !== 'move' && !(orderMode === 'support' && supportStep === 1)) {
      return;
    }

    if (orderMode === 'hold') {
      const { nation, type, region: from } = selectedUnit;
      const order = `${nation}: ${type} ${from} holds`;
      onOrderIssued?.(selectedUnit, order);
      resetInteraction();
      return;
    }

    if (orderMode === 'move') {
      const { nation, type, region: from } = selectedUnit;
      const order = `${nation}: ${type} ${from} -> ${region}`;
      onOrderIssued?.(selectedUnit, order);
      resetInteraction();
      return;
    }

    if (orderMode === 'support') {
      if (supportStep === 0 && clickedUnit) {
        if (clickedUnit.tag === 'MERC') return;
        setSupportStep(1);
        setSupportUnitRegion(region);
        setSupportUnitType(clickedUnit.type);
        return;
      }

      if (supportStep === 1) {
        const { nation, type, region: from } = selectedUnit;
        const supportFrom = supportUnitRegion;
        const supportTo = region;
        const order =
          supportFrom === supportTo
            ? `${nation}: ${type} ${from} supports ${supportUnitType} ${supportFrom}`
            : `${nation}: ${type} ${from} supports ${supportUnitType} ${supportFrom} -> ${supportTo}`;
        onOrderIssued?.(selectedUnit, order);
        resetInteraction();
        return;
      }
    }

    setSelectedRegion(region);
  }

  return {
    selectedRegion,
    selectedUnit,
    supportStep,
    supportUnitRegion,
    orderMode,
    handleSetOrderMode,
    handleRegionClick,
    selectCard,
    ghostUnits,
    cancelGhost,
    resetGhosts
  };
}
