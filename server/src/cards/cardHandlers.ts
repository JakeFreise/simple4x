import { Game } from '../game/Game';
import { UnitSnapshot, CardOrder } from '../../../shared/types';

function handleMERC(order: CardOrder, game: Game): void {
  const unit = order.unit;
  if (!unit) throw new Error(`MERC card requires a 'unit' field`);

  const ghost = game.addGhostUnit(order.unit!);
  order.unit = ghost; // update the CardOrder to reference the correct unit
}

function handleGOLD_BONUS(order: CardOrder, _game: Game): void {
  const amount = order.metadata?.amount ?? 1;
  console.log(`💰 ${order.nation} gains ${amount} gold (not yet tracked in player state)`);
  // TODO: Hook into economy module once it exists
}

function handleDEFENSE_BOOST(order: CardOrder, _game: Game): void {
  const region = order.metadata?.region;
  if (!region) throw new Error(`DEFENSE_BOOST card requires a 'region' in metadata`);
  console.log(`🛡️ ${order.nation} boosts defense in ${region}`);
  // TODO: Track region effect for adjudication use
}

function handleCANCEL_ORDER(order: CardOrder, game: Game): void {
  const region = order.metadata?.region;
  if (!region) throw new Error(`CANCEL_ORDER requires a 'region' to target`);
  game.removeOrder(order.nation, region);
  console.log(`❌ ${order.nation} canceled their unit order in ${region}`);
}

export const CardRegistry: Record<string, (order: CardOrder, game: Game) => void> = {
  MERCENARY: handleMERC,
  GOLD_BONUS: handleGOLD_BONUS,
  DEFENSE_BOOST: handleDEFENSE_BOOST,
  CANCEL_ORDER: handleCANCEL_ORDER,
};
