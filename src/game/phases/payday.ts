import {
  GameState,
  GameAction,
  EmployeeState,
} from '../types';
import { EMPLOYEE_DEFINITIONS, SALARY_AMOUNT } from '../constants';
import { updatePlayer, addLog, hasMilestone } from '../utils';

/** Process payday phase actions */
export function processPaydayAction(
  state: GameState,
  playerId: string,
  action: GameAction
): GameState {
  if (action.type === 'fire_employees') {
    const player = state.players.find(p => p.id === playerId)!;
    const fireIds = new Set(action.employeeIds);

    // Remove fired employees, return to supply
    const firedEmployees = player.employees.filter(e => fireIds.has(e.card.id));
    const remainingEmployees = player.employees.filter(e => !fireIds.has(e.card.id));

    const newSupply = { ...state.employeeSupply };
    for (const emp of firedEmployees) {
      if (emp.card.type !== 'ceo') {
        newSupply[emp.card.type] = (newSupply[emp.card.type] || 0) + 1;
      }
    }

    let newState = updatePlayer(state, playerId, { employees: remainingEmployees });
    newState = { ...newState, employeeSupply: newSupply };
    newState = addLog(newState, `${player.name} fired ${firedEmployees.length} employee(s).`, playerId);

    return newState;
  }

  if (action.type === 'done_firing') {
    let newState = updatePlayer(state, playerId, { isReady: true });

    // Process salary payment for this player
    newState = paySalaries(newState, playerId);

    // Check if all players done
    const allReady = newState.players.every(p => p.isReady);
    if (allReady) {
      newState = advanceToMarketing(newState);
    }

    return newState;
  }

  throw new Error(`Invalid action for payday phase: ${action.type}`);
}

function paySalaries(state: GameState, playerId: string): GameState {
  const player = state.players.find(p => p.id === playerId)!;

  // Count salaried employees (those in work slots or busy, not on beach)
  let salaryCount = 0;
  for (const emp of player.employees) {
    if (emp.card.type === 'ceo') continue;
    const def = EMPLOYEE_DEFINITIONS[emp.card.type];
    if (def.hasSalary && (emp.location === 'work_slot' || emp.location === 'busy')) {
      // Check if eternal campaigns milestone exempts marketers
      if (emp.location === 'busy' && hasMilestone(player, 'first_billboard_campaign')) {
        // Marketers with eternal campaigns don't need salary
        continue;
      }
      salaryCount++;
    }
  }

  let totalSalary = salaryCount * SALARY_AMOUNT;

  // First_to_train milestone: -$15 salary discount
  if (hasMilestone(player, 'first_to_train')) {
    totalSalary = Math.max(0, totalSalary - 15);
  }

  const newCash = player.cash - totalSalary;

  let newState = updatePlayer(state, playerId, { cash: newCash });

  if (totalSalary > 0) {
    newState = addLog(newState, `${player.name} paid $${totalSalary} in salaries (${salaryCount} employees).`, playerId);
  }

  // Check first_to_pay_20_salaries milestone
  if (totalSalary >= 20) {
    newState = tryAwardMilestone(newState, playerId, 'first_to_pay_20_salaries');
  }

  // Bankruptcy check
  if (newCash < 0) {
    newState = addLog(newState, `${player.name} is bankrupt!`, playerId);
    // Bankrupt players lose all cash, keep employees
    newState = updatePlayer(newState, playerId, { cash: 0 });
  }

  return newState;
}

function advanceToMarketing(state: GameState): GameState {
  let newState: GameState = {
    ...state,
    phase: 'marketing',
    players: state.players.map(p => ({ ...p, isReady: false })),
  };
  return addLog(newState, 'Marketing phase begins.');
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
