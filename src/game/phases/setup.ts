import {
  GameState,
  GameAction,
  RestaurantState,
} from '../types';
import { BANK_RESERVE_CARDS } from '../constants';
import { generateId, addLog, updatePlayer } from '../utils';

/** Process setup phase actions */
export function processSetupAction(
  state: GameState,
  playerId: string,
  action: GameAction
): GameState {
  switch (action.type) {
    case 'choose_bank_reserve': {
      const card = BANK_RESERVE_CARDS.find(c => c.value === action.value);
      if (!card) throw new Error('Invalid bank reserve value');
      let newState = updatePlayer(state, playerId, {
        bankReserveCard: card,
        ceoSlotCount: card.ceoSlots,
      });
      return addLog(newState, `${getPlayerName(state, playerId)} chose bank reserve card.`, playerId);
    }

    case 'place_starting_restaurant': {
      const player = state.players.find(p => p.id === playerId)!;
      if (player.restaurants.length >= 1) {
        throw new Error('Already placed starting restaurant');
      }

      const restaurant: RestaurantState = {
        id: generateId(),
        position: action.position,
        entranceCorner: action.entranceCorner,
        state: 'coming_soon',
        hasDriveIn: false,
      };

      // Place restaurant on map
      let newState = placeRestaurantOnMap(state, restaurant, playerId);
      newState = updatePlayer(newState, playerId, {
        restaurants: [...player.restaurants, restaurant],
        isReady: true,
      });
      newState = addLog(newState, `${player.name} placed starting restaurant.`, playerId);

      // Check if all players have placed or passed
      const allReady = newState.players.every(p => p.isReady);
      if (allReady) {
        newState = advanceFromSetup(newState);
      }

      return newState;
    }

    case 'pass_starting_restaurant': {
      let newState = updatePlayer(state, playerId, { isReady: true });
      const allReady = newState.players.every(p => p.isReady);
      if (allReady) {
        newState = advanceFromSetup(newState);
      }
      return newState;
    }

    default:
      throw new Error(`Invalid action for setup phase: ${action.type}`);
  }
}

function advanceFromSetup(state: GameState): GameState {
  let newState: GameState = {
    ...state,
    phase: 'restructuring',
    round: 1,
    players: state.players.map(p => ({ ...p, isReady: false })),
  };
  return addLog(newState, 'Setup complete. Round 1 begins - Restructuring phase.');
}

function placeRestaurantOnMap(state: GameState, restaurant: RestaurantState, playerId: string): GameState {
  const newTiles = state.mapTiles.map(row => row.map(tile => ({
    ...tile,
    grid: tile.grid.map(r => r.map(sq => ({ ...sq }))),
  })));

  for (let dr = 0; dr < 2; dr++) {
    for (let dc = 0; dc < 2; dc++) {
      const absRow = restaurant.position.row + dr;
      const absCol = restaurant.position.col + dc;
      const tileRow = Math.floor(absRow / 5);
      const tileCol = Math.floor(absCol / 5);
      const localRow = absRow % 5;
      const localCol = absCol % 5;

      if (tileRow >= 0 && tileRow < state.mapRows && tileCol >= 0 && tileCol < state.mapCols) {
        const corner = (dr === 0 ? 't' : 'b') + (dc === 0 ? 'l' : 'r');
        newTiles[tileRow][tileCol].grid[localRow][localCol] = {
          type: 'restaurant',
          ownerPlayerId: playerId,
          restaurantState: restaurant.state,
          isEntranceCorner: corner === restaurant.entranceCorner,
        };
      }
    }
  }

  return { ...state, mapTiles: newTiles };
}

function getPlayerName(state: GameState, playerId: string): string {
  return state.players.find(p => p.id === playerId)?.name ?? 'Unknown';
}
