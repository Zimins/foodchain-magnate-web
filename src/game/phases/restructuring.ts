import {
  GameState,
  GameAction,
  PlayerState,
  CompanyStructure,
  WorkSlotNode,
  EmployeeState,
} from '../types';
import { EMPLOYEE_DEFINITIONS } from '../constants';
import { updatePlayer, addLog, generateId } from '../utils';

/** Process restructuring phase actions */
export function processRestructuringAction(
  state: GameState,
  playerId: string,
  action: GameAction
): GameState {
  if (action.type !== 'submit_restructuring') {
    throw new Error(`Invalid action for restructuring phase: ${action.type}`);
  }

  const player = state.players.find(p => p.id === playerId)!;
  if (player.isReady) {
    throw new Error('Player already submitted restructuring');
  }

  const { workEmployeeIds, beachEmployeeIds } = action;

  // Validate: all IDs must be owned by this player
  const allIds = [...workEmployeeIds, ...beachEmployeeIds];
  const ceoEmployee = player.employees.find(e => e.card.type === 'ceo');
  if (!ceoEmployee) throw new Error('Player has no CEO');

  // Build company structure
  const structure = buildCompanyStructure(player, workEmployeeIds);

  // Update employee locations
  const newEmployees: EmployeeState[] = player.employees.map(emp => {
    if (emp.card.type === 'ceo') {
      return { ...emp, location: 'work_slot' as const };
    }
    if (workEmployeeIds.includes(emp.card.id)) {
      return { ...emp, location: 'work_slot' as const };
    }
    if (beachEmployeeIds.includes(emp.card.id)) {
      return { ...emp, location: 'on_the_beach' as const };
    }
    // Default: stay in hand
    return { ...emp, location: 'hand' as const };
  });

  let newState = updatePlayer(state, playerId, {
    employees: newEmployees,
    companyStructure: structure,
    isReady: true,
  });

  newState = addLog(newState, `${player.name} submitted company structure.`, playerId);

  // Check milestones after restructuring
  newState = checkRestructuringMilestones(newState, playerId);

  // Check if all players are ready
  const allReady = newState.players.every(p => p.isReady);
  if (allReady) {
    newState = advanceToOrderOfBusiness(newState);
  }

  return newState;
}

function buildCompanyStructure(player: PlayerState, workEmployeeIds: string[]): CompanyStructure {
  const ceo = player.employees.find(e => e.card.type === 'ceo')!;

  // Build work slots based on CEO slot count
  const ceoSlots: WorkSlotNode[] = [];
  for (let i = 0; i < player.ceoSlotCount; i++) {
    const assignedId = i < workEmployeeIds.length ? workEmployeeIds[i] : null;
    const emp = assignedId ? player.employees.find(e => e.card.id === assignedId) : null;

    const node: WorkSlotNode = {
      employeeId: assignedId,
      children: [],
    };

    // If the assigned employee is a manager type, create sub-slots
    if (emp) {
      const def = EMPLOYEE_DEFINITIONS[emp.card.type];
      if (def.workSlots > 0 && def.category === 'management') {
        for (let j = 0; j < def.workSlots; j++) {
          node.children.push({ employeeId: null, children: [] });
        }
      }
    }

    ceoSlots.push(node);
  }

  return {
    ceoEmployeeId: ceo.card.id,
    ceoSlots,
  };
}

function checkRestructuringMilestones(state: GameState, playerId: string): GameState {
  const player = state.players.find(p => p.id === playerId)!;
  const workingEmployees = player.employees.filter(e => e.location === 'work_slot');

  // Check first_waitress_played
  const hasWaitress = workingEmployees.some(e => e.card.type === 'waitress');
  if (hasWaitress) {
    state = tryAwardMilestone(state, playerId, 'first_waitress_played');
  }

  // Check first_errand_boy_played
  const hasErrandBoy = workingEmployees.some(e => e.card.type === 'errand_boy');
  if (hasErrandBoy) {
    state = tryAwardMilestone(state, playerId, 'first_errand_boy_played');
  }

  // Check first_cart_operator_played
  const hasCartOp = workingEmployees.some(e => e.card.type === 'cart_operator');
  if (hasCartOp) {
    state = tryAwardMilestone(state, playerId, 'first_cart_operator_played');
  }

  return state;
}

function tryAwardMilestone(state: GameState, playerId: string, milestoneId: string): GameState {
  const milestone = state.milestones.find(m => m.id === milestoneId);
  if (!milestone || !milestone.available || milestone.achievedBy.length > 0) {
    return state;
  }

  const player = state.players.find(p => p.id === playerId)!;

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

function advanceToOrderOfBusiness(state: GameState): GameState {
  let newState: GameState = {
    ...state,
    phase: 'order_of_business',
    players: state.players.map(p => ({ ...p, isReady: false })),
    activePlayerIndex: 0,
  };
  return addLog(newState, 'Order of Business phase begins.');
}
