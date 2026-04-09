import { GameEngine, PlayerSetupInfo } from '@/game/engine';
import type { GameState, GameConfig, GameAction, MapTile, MapSquare, HouseState, PlayerColor } from '@/game/types';
import { SETUP_BY_PLAYER_COUNT, MAX_DEMAND_NORMAL } from '@/game/constants';

export const P1 = 'player1';
export const P2 = 'player2';
export const P3 = 'player3';
export const P4 = 'player4';
export const P5 = 'player5';

const COLORS: PlayerColor[] = ['yellow', 'blue', 'red', 'green', 'purple'];
const NAMES = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve'];

export function createNPlayers(n: number): PlayerSetupInfo[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `player${i + 1}`,
    name: NAMES[i],
    color: COLORS[i],
  }));
}

export function createTestConfig(overrides?: Partial<GameConfig>): GameConfig {
  return {
    playerCount: 2,
    introductoryGame: false,
    useMilestones: true,
    useBankReserve: false,
    ...overrides,
  };
}

/** Build a test map matching the required dimensions for a given player count */
export function createTestMap(playerCount: number): { tiles: MapTile[][]; houses: HouseState[] } {
  const setup = SETUP_BY_PLAYER_COUNT[playerCount];
  const tiles: MapTile[][] = [];
  const houses: HouseState[] = [];
  let tileId = 1;
  let houseNum = 1;

  for (let tr = 0; tr < setup.mapRows; tr++) {
    const row: MapTile[] = [];
    for (let tc = 0; tc < setup.mapCols; tc++) {
      const grid: MapSquare[][] = [];
      for (let r = 0; r < 5; r++) {
        const cells: MapSquare[] = [];
        for (let c = 0; c < 5; c++) {
          const isEdge = r === 0 || r === 4 || c === 0 || c === 4;
          if (isEdge) {
            cells.push({ type: 'road' });
          } else if (r === 2 && c === 2) {
            cells.push({ type: 'house', houseNumber: houseNum });
          } else {
            cells.push({ type: 'empty' });
          }
        }
        grid.push(cells);
      }
      // 2x2 house block
      grid[2][3] = { type: 'house', houseNumber: houseNum };
      grid[3][2] = { type: 'house', houseNumber: houseNum };
      grid[3][3] = { type: 'house', houseNumber: houseNum };

      row.push({ id: tileId, grid, rotation: 0 });
      houses.push({
        number: houseNum,
        position: { row: tr * 5 + 2, col: tc * 5 + 2 },
        hasGarden: false,
        demand: [],
        maxDemand: MAX_DEMAND_NORMAL,
      });
      houseNum++;
      tileId++;
    }
    tiles.push(row);
  }

  return { tiles, houses };
}

/** Create a test game with N players */
export function createTestGame(configOverrides?: Partial<GameConfig>) {
  const playerCount = configOverrides?.playerCount ?? 2;
  const engine = new GameEngine();
  const config = createTestConfig({ playerCount, ...configOverrides });
  const players = createNPlayers(playerCount);
  const map = createTestMap(playerCount);
  const state = engine.createGame(config, players, map);
  return { engine, state, playerIds: players.map(p => p.id) };
}

/** Get active player ID */
export function activeId(state: GameState): string {
  return state.players[state.activePlayerIndex].id;
}

/** All players pass starting restaurant */
export function passSetup(engine: GameEngine, state: GameState, playerIds: string[]): GameState {
  let s = state;
  for (const id of playerIds) {
    s = engine.processAction(s, id, { type: 'pass_starting_restaurant' });
  }
  return s;
}

/** All players submit empty restructuring (CEO only) */
export function passRestructuring(engine: GameEngine, state: GameState, playerIds: string[]): GameState {
  let s = state;
  for (const id of playerIds) {
    s = engine.processAction(s, id, {
      type: 'submit_restructuring',
      workEmployeeIds: [],
      beachEmployeeIds: [],
    });
  }
  return s;
}

/** All players pick turn order sequentially */
export function passOrderOfBusiness(engine: GameEngine, state: GameState): GameState {
  let s = state;
  let pos = 1;
  while (s.phase === 'order_of_business') {
    s = engine.processAction(s, activeId(s), { type: 'choose_turn_order', position: pos++ });
  }
  return s;
}

/** Skip all working sub-phases for all players */
export function skipAllWorking(engine: GameEngine, state: GameState): GameState {
  let s = state;
  const skipMap: Record<string, GameAction> = {
    hire: { type: 'skip_hire' },
    train: { type: 'skip_train' },
    launch_campaigns: { type: 'skip_campaigns' },
    prep_food_drinks: { type: 'skip_prep' },
    place_houses_gardens: { type: 'skip_houses' },
    place_move_restaurants: { type: 'skip_restaurants' },
  };

  let iterations = 0;
  while (s.phase === 'working_9_to_5' && iterations < 100) {
    iterations++;
    const sub = s.workingSubPhase!;

    if (sub === 'open_drive_ins') {
      s = engine.processAction(s, activeId(s), { type: 'skip_hire' } as GameAction);
      continue;
    }

    const skip = skipMap[sub];
    if (!skip) throw new Error(`Unknown sub-phase: ${sub}`);

    const prevSub = sub;
    s = engine.processAction(s, activeId(s), skip);

    // If still same sub-phase, remaining players skip too
    while (s.phase === 'working_9_to_5' && s.workingSubPhase === prevSub) {
      s = engine.processAction(s, activeId(s), skip);
    }
  }
  return s;
}

/** All players done firing in payday */
export function passPayday(engine: GameEngine, state: GameState, playerIds: string[]): GameState {
  let s = state;
  for (const id of playerIds) {
    if (s.phase !== 'payday') break;
    s = engine.processAction(s, id, { type: 'done_firing' });
  }
  return s;
}

/** Drive one full round: restructuring → order → working → payday → next restructuring */
export function playOneRound(engine: GameEngine, state: GameState, playerIds: string[]): GameState {
  let s = state;
  s = passRestructuring(engine, s, playerIds);
  s = passOrderOfBusiness(engine, s);
  s = skipAllWorking(engine, s);
  s = passPayday(engine, s, playerIds);
  return s;
}
