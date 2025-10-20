import { useState } from 'react';
import { Unit } from '../../../shared/types';


export function useMapInteraction(units, getUnitAt, setOrder, currentPhase) {
  const isCardOrderPhase = currentPhase?.phase === 'card_orders';
  const isRetreatPhase = currentPhase?.phase === 'retreats';
  const [retreatOptions, setRetreatOptions] = useState<string[]>([]);

  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [orderMode, setOrderMode] = useState<'hold' | 'move' | 'support' | null>(null);

  const [supportStep, setSupportStep] = useState(0);
  const [supportUnitRegion, setSupportUnitRegion] = useState<string | null>(null);
  const [supportUnitType, setSupportUnitType] = useState<'A' | 'F' | null>(null);

  const [cardSpawnMode, setCardSpawnMode] = useState(false);
  const [cardSpawningNation, setCardSpawningNation] = useState<string | null>(null);

  const [ghostUnits, setGhostUnits] = useState<Unit[]>([]); 

  function resetInteraction() {
    setSelectedUnit(null);
    setSelectedRegion(null);
    setOrderMode(null);
    setSupportStep(0);
    setSupportUnitRegion(null);
    setSupportUnitType(null);
  }

  function resetGhosts(){
    setGhostUnits([]);
  }

  function cancelGhost(region) {
    setGhostUnits(prev => prev.filter(u => u.region !== region));
    resetInteraction();
  }

  function selectCard(cardType, nation) {
    if (cardType === 'spawn') {
      console.log("reinforcements")
      setCardSpawnMode(true);
      setCardSpawningNation(nation);
      resetInteraction(); // reset any previous unit selection
    }
  }

  function handleSetOrderMode(mode) {
    setOrderMode(mode);

    if (mode === 'hold' && selectedUnit) {
      const { nation, type, region } = selectedUnit;
      setOrder(`${nation}: ${type} ${region} holds`);
      resetInteraction(); // ← correct call here
    }
  }

  function handleRegionClick(region) {
    const allUnits = [...units, ...ghostUnits];
    const clickedUnit = allUnits.find(u => u.region === region);

    const isGhostHere = ghostUnits.some(u => u.region === region);
    const isGhostSelected =
      selectedUnit != null &&
      ghostUnits.some(u => u.region === selectedUnit.region && u.nation === selectedUnit.nation);

    // === RETREAT PHASE ===
    if (isRetreatPhase) {
      if (!selectedUnit) {
        if (clickedUnit?.status === 'dislodged' && Array.isArray(clickedUnit.retreat_options)) {
          setSelectedUnit(clickedUnit);
          setSelectedRegion(region);
          setRetreatOptions(clickedUnit.retreat_options); // ✅ save options
        }
        return;
      }

      const { nation, type, region: from } = selectedUnit;

      if (region === from) {
        setOrder(`${nation}: ${type} ${from} disbands`);
        resetInteraction();
        return;
      }

      if (retreatOptions.includes(region)) {
        setOrder(`${nation}: ${type} ${from} -> ${region}`);
        resetInteraction();
        return;
      }

      return;
    }

    // === CARD PHASE: ghost selection logic ===
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

      const type: 'A' | 'F' = 'A';
      const nation = cardSpawningNation + "_MERC";
      const newUnit: Unit = { nation, type, region };
      setGhostUnits(prev => [...prev, newUnit]);
      setSelectedUnit(newUnit);
      setSelectedRegion(region);
      setCardSpawnMode(false);
      setCardSpawningNation(null);
      return;
    }

    // === ORDER SELECTION ===
    if (!selectedUnit) {
      if (clickedUnit) {
        setSelectedUnit(clickedUnit);
        setSelectedRegion(region);
      }
      return;
    }

    if (!orderMode) {
      const { nation, type, region: from } = selectedUnit;

      if (region === from) {
        setOrder(`${nation}: ${type} ${from} holds`);
      } else {
        setOrder(`${nation}: ${type} ${from} -> ${region}`);
      }
      resetInteraction();
      return;
    }

    if (!clickedUnit && orderMode !== 'move' && !(orderMode === 'support' && supportStep === 1)) {
      return;
    }

    if (selectedUnit && orderMode === 'hold') {
      const { nation, type, region: from } = selectedUnit;
      setOrder(`${nation}: ${type} ${from} holds`);
      resetInteraction();
      return;
    }

    if (selectedUnit && orderMode === 'move') {
      const { nation, type, region: from } = selectedUnit;
      setOrder(`${nation}: ${type} ${from} -> ${region}`);
      resetInteraction();
      return;
    }

    if (selectedUnit && orderMode === 'support') {
      if (supportStep === 0 && clickedUnit) {
        if (clickedUnit.nation.includes('_MERC')) return;
        setSupportStep(1);
        setSupportUnitRegion(region);
        setSupportUnitType(clickedUnit.type);
        return;
      }

      if (supportStep === 1) {
        const { nation, type, region: from } = selectedUnit;
        const supportFrom = supportUnitRegion;
        const supportTo = region;
        const orderText =
          supportFrom === supportTo
            ? `${nation}: ${type} ${from} supports ${supportUnitType} ${supportFrom}`
            : `${nation}: ${type} ${from} supports ${supportUnitType} ${supportFrom} -> ${supportTo}`;
        setOrder(orderText);
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
