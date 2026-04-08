import { GameState, GameAction } from '../types';
import { countOpenWorkSlots, addLog, updatePlayer, getFirstPlayerIndex } from '../utils';

/** Process order of business phase actions */
export function processOrderOfBusinessAction(
  state: GameState,
  playerId: string,
  action: GameAction
): GameState {
  if (action.type !== 'choose_turn_order') {
    throw new Error(`Invalid action for order_of_business phase: ${action.type}`);
  }

  const player = state.players.find(p => p.id === playerId)!;
  const position = action.position;

  // Validate position is available
  if (position < 1 || position > state.players.length) {
    throw new Error('Invalid turn order position');
  }
  const taken = state.players.some(p => p.id !== playerId && p.isReady && p.turnOrder === position);
  if (taken) {
    throw new Error('Turn order position already taken');
  }

  let newState = updatePlayer(state, playerId, {
    turnOrder: position,
    isReady: true,
  });
  newState = addLog(newState, `${player.name} chose turn order position ${position}.`, playerId);

  // Check if all players have chosen
  const allReady = newState.players.every(p => p.isReady);
  if (allReady) {
    newState = advanceToWorking(newState);
  } else {
    // Move to next player by open slots (descending)
    newState = advanceToNextChooser(newState, playerId);
  }

  return newState;
}

/** Determine turn order selection order: most open work slots picks first */
export function initializeOrderOfBusiness(state: GameState): GameState {
  // Sort players by open work slots (descending), then current turn order as tiebreaker
  const playerSlots = state.players.map(p => ({
    id: p.id,
    slots: countOpenWorkSlots(p.companyStructure) +
      (p.milestones.includes('first_airplane_campaign') ? 2 : 0),
    currentOrder: p.turnOrder,
  }));

  playerSlots.sort((a, b) => {
    if (b.slots !== a.slots) return b.slots - a.slots;
    return a.currentOrder - b.currentOrder;
  });

  // Set active player to the one with most slots
  const firstChooser = playerSlots[0];
  const activeIdx = state.players.findIndex(p => p.id === firstChooser.id);

  return {
    ...state,
    activePlayerIndex: activeIdx,
    players: state.players.map(p => ({ ...p, isReady: false })),
  };
}

function advanceToNextChooser(state: GameState, justChoseId: string): GameState {
  const playerSlots = state.players
    .filter(p => !p.isReady)
    .map(p => ({
      id: p.id,
      slots: countOpenWorkSlots(p.companyStructure) +
        (p.milestones.includes('first_airplane_campaign') ? 2 : 0),
      currentOrder: p.turnOrder,
    }));

  playerSlots.sort((a, b) => {
    if (b.slots !== a.slots) return b.slots - a.slots;
    return a.currentOrder - b.currentOrder;
  });

  if (playerSlots.length === 0) return state;

  const nextIdx = state.players.findIndex(p => p.id === playerSlots[0].id);
  return { ...state, activePlayerIndex: nextIdx };
}

function advanceToWorking(state: GameState): GameState {
  const firstIdx = getFirstPlayerIndex(state);
  let newState: GameState = {
    ...state,
    phase: 'working_9_to_5',
    workingSubPhase: 'hire',
    activePlayerIndex: firstIdx,
    players: state.players.map(p => ({ ...p, isReady: false })),
  };
  return addLog(newState, 'Working 9 to 5 phase begins - Hiring sub-phase.');
}
