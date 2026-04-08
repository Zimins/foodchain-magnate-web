import {
  GameState,
  PlayerState,
  HouseState,
  ItemType,
  AbsolutePosition,
} from '../types';
import {
  WAITRESS_BONUS,
  WAITRESS_MILESTONE_BONUS,
  CFO_BONUS_PERCENT,
  BASE_ITEM_PRICE,
} from '../constants';
import {
  addLog,
  updatePlayer,
  manhattanDistance,
  calculateItemPrice,
  countWorkingOfType,
  hasMilestone,
  getPlayersByTurnOrder,
  getEntrancePosition,
  areRoadConnected,
} from '../utils';

interface RestaurantOffer {
  playerId: string;
  effectivePrice: number;
  distance: number;
  waitressCount: number;
  turnOrder: number;
}

/** Process dinnertime - fully automatic */
export function processDinnertime(state: GameState): GameState {
  // Calculate item prices for all players
  let newState = state;
  for (const player of newState.players) {
    const price = calculateItemPrice(player);
    newState = updatePlayer(newState, player.id, { itemPrice: price });
  }

  // Process houses in order of house number (lowest first)
  const sortedHouses = [...newState.houses].sort((a, b) => a.number - b.number);

  for (const house of sortedHouses) {
    if (house.demand.length === 0) continue;
    newState = processHouseDemand(newState, house);
  }

  // Check bank breaking
  newState = checkBankBreaking(newState);

  // Advance to payday
  newState = {
    ...newState,
    phase: 'payday',
    players: newState.players.map(p => ({ ...p, isReady: false })),
  };
  return addLog(newState, 'Payday phase begins.');
}

function processHouseDemand(state: GameState, house: HouseState): GameState {
  let newState = state;
  const demand = [...house.demand];

  if (demand.length === 0) return newState;

  // Find restaurants that can fulfill ALL demand for this house
  const candidates: RestaurantOffer[] = [];

  for (const player of newState.players) {
    for (const restaurant of player.restaurants) {
      if (restaurant.state !== 'open') continue;

      // Check road connection (simplified: always connected)
      const entrancePos = getEntrancePosition(restaurant.position, restaurant.entranceCorner);
      if (!areRoadConnected(newState, entrancePos, house.position)) continue;

      // Check if player can fulfill ALL demand
      const canFulfill = canPlayerFulfillDemand(player, demand);
      if (!canFulfill) continue;

      // Calculate effective price
      const distance = Math.floor(manhattanDistance(entrancePos, house.position) / 5);
      const effectivePrice = player.itemPrice + distance;
      const waitressCount = countWorkingOfType(player, 'waitress');

      candidates.push({
        playerId: player.id,
        effectivePrice,
        distance,
        waitressCount,
        turnOrder: player.turnOrder,
      });
    }
  }

  if (candidates.length === 0) return newState;

  // Sort by: lowest effective price, then most waitresses, then turn order
  candidates.sort((a, b) => {
    if (a.effectivePrice !== b.effectivePrice) return a.effectivePrice - b.effectivePrice;
    if (b.waitressCount !== a.waitressCount) return b.waitressCount - a.waitressCount;
    return a.turnOrder - b.turnOrder;
  });

  const winner = candidates[0];
  const player = newState.players.find(p => p.id === winner.playerId)!;

  // Serve the demand
  const itemCount = demand.length;
  const revenue = itemCount * player.itemPrice;

  // Deduct items from stock
  const newStock = { ...player.stock };
  for (const item of demand) {
    newStock[item] = Math.max(0, (newStock[item] || 0) - 1);
  }

  // Calculate bonuses
  let totalRevenue = revenue;

  // Waitress bonus
  const waitressCount = countWorkingOfType(player, 'waitress');
  if (waitressCount > 0) {
    const bonusPerWaitress = hasMilestone(player, 'first_waitress_played')
      ? WAITRESS_MILESTONE_BONUS
      : WAITRESS_BONUS;
    totalRevenue += waitressCount * bonusPerWaitress;
  }

  // Milestone sale bonuses
  let milestoneBonus = 0;
  for (const item of demand) {
    if (item === 'burger' && hasMilestone(player, 'first_burger_marketed')) milestoneBonus += 5;
    if (item === 'pizza' && hasMilestone(player, 'first_pizza_marketed')) milestoneBonus += 5;
    if ((item === 'soda' || item === 'lemonade' || item === 'beer') && hasMilestone(player, 'first_drink_marketed')) {
      milestoneBonus += 5;
    }
  }
  totalRevenue += milestoneBonus;

  // CFO bonus (50% of base revenue)
  const hasCFO = countWorkingOfType(player, 'cfo') > 0;
  const hasCEOasCFO = hasMilestone(player, 'first_to_have_100');
  if (hasCFO || hasCEOasCFO) {
    totalRevenue += Math.floor(revenue * CFO_BONUS_PERCENT / 100);
  }

  // Pay from bank
  const actualPayment = Math.min(totalRevenue, newState.bank);

  newState = updatePlayer(newState, winner.playerId, {
    stock: newStock,
    cash: player.cash + actualPayment,
  });

  newState = { ...newState, bank: newState.bank - actualPayment };

  // Clear demand from house
  newState = {
    ...newState,
    houses: newState.houses.map(h =>
      h.number === house.number ? { ...h, demand: [] } : h
    ),
  };

  // Check $20 and $100 milestones
  const updatedPlayer = newState.players.find(p => p.id === winner.playerId)!;
  if (updatedPlayer.cash >= 20) {
    newState = tryAwardMilestone(newState, winner.playerId, 'first_to_have_20');
  }
  if (updatedPlayer.cash >= 100) {
    newState = tryAwardMilestone(newState, winner.playerId, 'first_to_have_100');
  }

  newState = addLog(
    newState,
    `${player.name} served house #${house.number} for $${actualPayment}.`,
    winner.playerId
  );

  return newState;
}

function canPlayerFulfillDemand(player: PlayerState, demand: ItemType[]): boolean {
  const needed: Record<string, number> = {};
  for (const item of demand) {
    needed[item] = (needed[item] || 0) + 1;
  }

  // Also check freezer items
  const available: Record<string, number> = { ...player.stock };
  if (player.hasFreezer) {
    for (const item of player.freezer) {
      available[item] = (available[item] || 0) + 1;
    }
  }

  for (const [item, count] of Object.entries(needed)) {
    if ((available[item] || 0) < count) return false;
  }
  return true;
}

function checkBankBreaking(state: GameState): GameState {
  if (state.bank > 0) return state;

  let newState = { ...state, bankBrokenCount: state.bankBrokenCount + 1 };

  if (newState.bankBrokenCount === 1) {
    // First break: reveal reserves, refill bank
    let totalReserve = 0;
    for (const player of newState.players) {
      if (player.bankReserveCard) {
        totalReserve += player.bankReserveCard.value;
      }
    }
    newState = {
      ...newState,
      bank: totalReserve,
      bankReserveRevealed: true,
    };
    newState = addLog(newState, `Bank broke! Reserve of $${totalReserve} added.`);
  } else {
    // Second break: game over after this dinnertime
    newState = addLog(newState, 'Bank broke a second time! Game will end after this round.');
  }

  return newState;
}

function tryAwardMilestone(state: GameState, playerId: string, milestoneId: string): GameState {
  const milestone = state.milestones.find(m => m.id === milestoneId);
  if (!milestone || !milestone.available || milestone.achievedBy.length > 0) {
    return state;
  }

  return {
    ...state,
    milestones: state.milestones.map(m =>
      m.id === milestoneId ? { ...m, achievedBy: [playerId] } : m
    ),
    players: state.players.map(p =>
      p.id === playerId
        ? { ...p, milestones: [...p.milestones, milestoneId as any] }
        : p
    ),
  };
}
