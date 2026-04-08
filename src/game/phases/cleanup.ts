import {
  GameState,
  GameAction,
  ItemType,
} from '../types';
import { FREEZER_CAPACITY } from '../constants';
import { addLog, updatePlayer, hasMilestone } from '../utils';

/** Process cleanup phase */
export function processCleanup(state: GameState): GameState {
  let newState = state;

  // Process each player
  for (const player of newState.players) {
    // Check for unsold items
    const totalStock = Object.values(player.stock).reduce((sum, n) => sum + n, 0);

    if (totalStock > 0) {
      // Award first_to_throw_away milestone (gives freezer)
      newState = tryAwardMilestone(newState, player.id, 'first_to_throw_away');

      const updatedPlayer = newState.players.find(p => p.id === player.id)!;

      if (updatedPlayer.hasFreezer) {
        // Store items in freezer up to capacity
        const currentFreezer = [...updatedPlayer.freezer];
        const itemsToStore: ItemType[] = [];

        for (const [itemType, count] of Object.entries(updatedPlayer.stock) as [ItemType, number][]) {
          for (let i = 0; i < count && currentFreezer.length + itemsToStore.length < FREEZER_CAPACITY; i++) {
            itemsToStore.push(itemType);
          }
        }

        newState = updatePlayer(newState, player.id, {
          stock: { burger: 0, pizza: 0, soda: 0, lemonade: 0, beer: 0 },
          freezer: [...currentFreezer, ...itemsToStore],
        });

        if (itemsToStore.length > 0) {
          newState = addLog(newState, `${updatedPlayer.name} stored ${itemsToStore.length} item(s) in freezer.`, player.id);
        }
      } else {
        // Discard all unsold items
        newState = updatePlayer(newState, player.id, {
          stock: { burger: 0, pizza: 0, soda: 0, lemonade: 0, beer: 0 },
        });

        if (totalStock > 0) {
          newState = addLog(newState, `${player.name} discarded ${totalStock} unsold item(s).`, player.id);
        }
      }
    }

    // Return employees to hand
    newState = updatePlayer(newState, player.id, {
      employees: newState.players.find(p => p.id === player.id)!.employees.map(e => ({
        ...e,
        location: e.location === 'busy' ? 'busy' as const : 'hand' as const,
      })),
      companyStructure: null,
      isReady: false,
    });

    // Open "coming soon" restaurants
    const updatedRestaurants = newState.players.find(p => p.id === player.id)!.restaurants.map(r =>
      r.state === 'coming_soon' ? { ...r, state: 'open' as const } : r
    );
    newState = updatePlayer(newState, player.id, { restaurants: updatedRestaurants });
  }

  // Cross out achieved milestones (mark as unavailable)
  newState = {
    ...newState,
    milestones: newState.milestones.map(m =>
      m.achievedBy.length > 0 ? { ...m, available: false } : m
    ),
  };

  // Check game end conditions
  if (shouldGameEnd(newState)) {
    return endGame(newState);
  }

  // Advance to next round
  return advanceToNextRound(newState);
}

function shouldGameEnd(state: GameState): boolean {
  // Game ends if bank broke twice
  if (state.bankBrokenCount >= 2) return true;

  // Game also ends if bank is at 0 after second break
  // (already handled by bankBrokenCount)

  return false;
}

function endGame(state: GameState): GameState {
  // Determine winner: most cash
  const sorted = [...state.players].sort((a, b) => b.cash - a.cash);
  const winner = sorted[0];

  let newState: GameState = {
    ...state,
    phase: 'game_over',
    winnerId: winner.id,
  };

  return addLog(newState, `Game over! ${winner.name} wins with $${winner.cash}!`);
}

function advanceToNextRound(state: GameState): GameState {
  let newState: GameState = {
    ...state,
    phase: 'restructuring',
    round: state.round + 1,
    players: state.players.map(p => ({ ...p, isReady: false })),
  };
  return addLog(newState, `Round ${newState.round} begins - Restructuring phase.`);
}

function tryAwardMilestone(state: GameState, playerId: string, milestoneId: string): GameState {
  const milestone = state.milestones.find(m => m.id === milestoneId);
  if (!milestone || !milestone.available || milestone.achievedBy.length > 0) {
    return state;
  }

  let newState = {
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

  // Apply milestone effects
  if (milestoneId === 'first_to_throw_away') {
    newState = updatePlayer(newState, playerId, { hasFreezer: true });
  }

  return newState;
}
