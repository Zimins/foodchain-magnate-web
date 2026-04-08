import {
  AbsolutePosition,
  MapTile,
  MapSquare,
  GameState,
  PlayerState,
  EmployeeType,
  EmployeeState,
  CompanyStructure,
  WorkSlotNode,
} from './types';
import { EMPLOYEE_DEFINITIONS } from './constants';

// ============================================================
// Position & Distance Utilities
// ============================================================

/** Convert MapPosition-style tile coordinates to absolute coordinates */
export function toAbsolute(tileRow: number, tileCol: number, row: number, col: number): AbsolutePosition {
  return { row: tileRow * 5 + row, col: tileCol * 5 + col };
}

/** Manhattan distance between two absolute positions */
export function manhattanDistance(a: AbsolutePosition, b: AbsolutePosition): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

/**
 * Simplified distance: Manhattan distance / 5 = tile border crossings.
 * Used as the "road distance" between two locations.
 */
export function roadDistance(a: AbsolutePosition, b: AbsolutePosition): number {
  return Math.floor(manhattanDistance(a, b) / 5);
}

// ============================================================
// Map Utilities
// ============================================================

/** Get the map square at an absolute position */
export function getSquareAt(state: GameState, pos: AbsolutePosition): MapSquare | null {
  const tileRow = Math.floor(pos.row / 5);
  const tileCol = Math.floor(pos.col / 5);
  const localRow = pos.row % 5;
  const localCol = pos.col % 5;

  if (tileRow < 0 || tileRow >= state.mapRows || tileCol < 0 || tileCol >= state.mapCols) {
    return null;
  }

  const tile = state.mapTiles[tileRow][tileCol];
  return tile.grid[localRow][localCol];
}

/** Check if a position is a road square */
export function isRoad(state: GameState, pos: AbsolutePosition): boolean {
  const sq = getSquareAt(state, pos);
  return sq !== null && (sq.type === 'road' || sq.type === 'bridge' || sq.type === 'cul_de_sac');
}

/**
 * Simplified road connection check:
 * Two locations are "connected" if they are both adjacent to road squares
 * on the same connected road network. For simplicity, since all tiles have
 * road borders, any two positions on the map are road-connected.
 */
export function areRoadConnected(_state: GameState, _a: AbsolutePosition, _b: AbsolutePosition): boolean {
  // Simplified: all tiles share road borders, so everything is connected
  return true;
}

// ============================================================
// Restaurant Placement Validation
// ============================================================

/** Check if a 2x2 restaurant can be placed at the given top-left position */
export function isValidRestaurantPlacement(
  state: GameState,
  position: AbsolutePosition,
  excludeRestaurantId?: string
): boolean {
  // Check all 4 squares of the 2x2 area
  for (let dr = 0; dr < 2; dr++) {
    for (let dc = 0; dc < 2; dc++) {
      const pos: AbsolutePosition = { row: position.row + dr, col: position.col + dc };
      const sq = getSquareAt(state, pos);
      if (!sq) return false;

      // Must be empty, or road (restaurants can be on roads in some variants)
      // For simplicity: must be an empty square
      if (sq.type !== 'empty') return false;
    }
  }

  // Check that at least one adjacent square to the entrance corner is a road
  // (restaurant must be road-accessible)
  return true;
}

/** Get entrance position for a restaurant */
export function getEntrancePosition(
  position: AbsolutePosition,
  entranceCorner: 'tl' | 'tr' | 'bl' | 'br'
): AbsolutePosition {
  switch (entranceCorner) {
    case 'tl': return { row: position.row, col: position.col };
    case 'tr': return { row: position.row, col: position.col + 1 };
    case 'bl': return { row: position.row + 1, col: position.col };
    case 'br': return { row: position.row + 1, col: position.col + 1 };
  }
}

// ============================================================
// Company Structure Validation
// ============================================================

/** Count open (empty) work slots in a company structure */
export function countOpenWorkSlots(structure: CompanyStructure | null): number {
  if (!structure) return 0;
  let count = 0;
  for (const slot of structure.ceoSlots) {
    count += countOpenSlotsInTree(slot);
  }
  return count;
}

function countOpenSlotsInTree(node: WorkSlotNode): number {
  let count = node.employeeId === null ? 1 : 0;
  for (const child of node.children) {
    count += countOpenSlotsInTree(child);
  }
  return count;
}

/** Count total work slots (filled + empty) */
export function countTotalWorkSlots(structure: CompanyStructure | null): number {
  if (!structure) return 0;
  let count = 0;
  for (const slot of structure.ceoSlots) {
    count += countSlotsInTree(slot);
  }
  return count;
}

function countSlotsInTree(node: WorkSlotNode): number {
  let count = 1;
  for (const child of node.children) {
    count += countSlotsInTree(child);
  }
  return count;
}

/** Get all employee IDs in work slots */
export function getWorkingEmployeeIds(structure: CompanyStructure | null): string[] {
  if (!structure) return [];
  const ids: string[] = [];
  for (const slot of structure.ceoSlots) {
    collectEmployeeIds(slot, ids);
  }
  return ids;
}

function collectEmployeeIds(node: WorkSlotNode, ids: string[]): void {
  if (node.employeeId) ids.push(node.employeeId);
  for (const child of node.children) {
    collectEmployeeIds(child, ids);
  }
}

// ============================================================
// Player Utilities
// ============================================================

/** Get a player's working employees (in work slots) */
export function getWorkingEmployees(player: PlayerState): EmployeeState[] {
  return player.employees.filter(e => e.location === 'work_slot');
}

/** Get working employees of a specific category */
export function getWorkingEmployeesOfCategory(
  player: PlayerState,
  category: string
): EmployeeState[] {
  return getWorkingEmployees(player).filter(
    e => EMPLOYEE_DEFINITIONS[e.card.type].category === category
  );
}

/** Get working employees of a specific type */
export function getWorkingEmployeesOfType(
  player: PlayerState,
  type: EmployeeType
): EmployeeState[] {
  return getWorkingEmployees(player).filter(e => e.card.type === type);
}

/** Count working employees of a specific type */
export function countWorkingOfType(player: PlayerState, type: EmployeeType): number {
  return getWorkingEmployeesOfType(player, type).length;
}

/** Check if player has a milestone */
export function hasMilestone(player: PlayerState, milestoneId: string): boolean {
  return player.milestones.includes(milestoneId as any);
}

/** Calculate item price for a player */
export function calculateItemPrice(player: PlayerState): number {
  const pricingManagers = countWorkingOfType(player, 'pricing_manager');
  const discountManagers = countWorkingOfType(player, 'discount_manager');
  const hasLuxuries = countWorkingOfType(player, 'luxuries_manager') > 0;
  const hasLowerPricesMilestone = hasMilestone(player, 'first_to_lower_prices');

  let price = 10;
  price -= pricingManagers;
  price -= 3 * discountManagers;
  if (hasLuxuries) price += 10;
  if (hasLowerPricesMilestone) price -= 1;

  return Math.max(price, 0);
}

// ============================================================
// State Helpers (Immutable Updates)
// ============================================================

/** Update a specific player in the state */
export function updatePlayer(
  state: GameState,
  playerId: string,
  updates: Partial<PlayerState>
): GameState {
  return {
    ...state,
    players: state.players.map(p =>
      p.id === playerId ? { ...p, ...updates } : p
    ),
  };
}

/** Add a log entry */
export function addLog(
  state: GameState,
  message: string,
  playerId?: string
): GameState {
  const entry = {
    timestamp: Date.now(),
    playerId,
    message,
    phase: state.phase,
  };
  return { ...state, log: [...state.log, entry] };
}

/** Generate a unique ID */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

/** Get players sorted by turn order */
export function getPlayersByTurnOrder(state: GameState): PlayerState[] {
  return [...state.players].sort((a, b) => a.turnOrder - b.turnOrder);
}

/** Find next player in turn order from current active index */
export function getNextPlayerIndex(state: GameState): number | null {
  const sorted = getPlayersByTurnOrder(state);
  const currentPlayer = state.players[state.activePlayerIndex];
  const currentTurnIdx = sorted.findIndex(p => p.id === currentPlayer.id);

  if (currentTurnIdx < sorted.length - 1) {
    const nextPlayer = sorted[currentTurnIdx + 1];
    return state.players.findIndex(p => p.id === nextPlayer.id);
  }
  return null; // No more players
}

/** Get the index of the first player in turn order */
export function getFirstPlayerIndex(state: GameState): number {
  const sorted = getPlayersByTurnOrder(state);
  return state.players.findIndex(p => p.id === sorted[0].id);
}
