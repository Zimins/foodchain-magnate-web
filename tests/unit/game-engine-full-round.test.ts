import { describe, it, expect } from 'vitest';
import type { GameState } from '@/game/types';
import {
  createTestGame, P1, P2, activeId,
  passSetup, passRestructuring, passOrderOfBusiness,
  skipAllWorking, passPayday, playOneRound,
} from './game-engine-helpers';

describe('2-player game', () => {
  it('completes full round: setup → restructuring → order → working → payday → round 2', () => {
    const { engine, state, playerIds } = createTestGame();
    expect(state.phase).toBe('setup');

    let s = passSetup(engine, state, playerIds);
    expect(s.phase).toBe('restructuring');
    expect(s.round).toBe(1);

    s = playOneRound(engine, s, playerIds);
    expect(s.phase).toBe('restructuring');
    expect(s.round).toBe(2);
  });

  it('plays 3 consecutive rounds', () => {
    const { engine, state, playerIds } = createTestGame();
    let s = passSetup(engine, state, playerIds);

    for (let round = 1; round <= 3; round++) {
      expect(s.phase).toBe('restructuring');
      expect(s.round).toBe(round);
      s = playOneRound(engine, s, playerIds);
    }
    expect(s.round).toBe(4);
  });

  it('allows restaurant placement during setup', () => {
    const { engine, state } = createTestGame();
    let s = engine.processAction(state, P1, {
      type: 'place_starting_restaurant',
      position: { row: 1, col: 1 },
      entranceCorner: 'tl',
    });
    expect(s.players.find(p => p.id === P1)!.restaurants).toHaveLength(1);
    s = engine.processAction(s, P2, { type: 'pass_starting_restaurant' });
    expect(s.phase).toBe('restructuring');
  });

  it('rejects out-of-turn actions', () => {
    const { engine, state, playerIds } = createTestGame();
    let s = passSetup(engine, state, playerIds);
    s = passRestructuring(engine, s, playerIds);

    const active = activeId(s);
    const inactive = active === P1 ? P2 : P1;
    expect(() => {
      engine.processAction(s, inactive, { type: 'choose_turn_order', position: 1 });
    }).toThrow('Not your turn');
  });
});

describe('3-player game', () => {
  it('completes full round', () => {
    const { engine, state, playerIds } = createTestGame({ playerCount: 3 });
    expect(state.players).toHaveLength(3);

    let s = passSetup(engine, state, playerIds);
    expect(s.phase).toBe('restructuring');

    s = playOneRound(engine, s, playerIds);
    expect(s.phase).toBe('restructuring');
    expect(s.round).toBe(2);
  });

  it('all 3 players choose turn order sequentially', () => {
    const { engine, state, playerIds } = createTestGame({ playerCount: 3 });
    let s = passSetup(engine, state, playerIds);
    s = passRestructuring(engine, s, playerIds);
    expect(s.phase).toBe('order_of_business');

    // Each player should get a turn to choose
    const chosen: string[] = [];
    let pos = 1;
    while (s.phase === 'order_of_business') {
      const who = activeId(s);
      expect(chosen).not.toContain(who);
      chosen.push(who);
      s = engine.processAction(s, who, { type: 'choose_turn_order', position: pos++ });
    }
    expect(chosen).toHaveLength(3);
    expect(s.phase).toBe('working_9_to_5');
  });
});

describe('4-player game', () => {
  it('completes full round', () => {
    const { engine, state, playerIds } = createTestGame({ playerCount: 4 });
    expect(state.players).toHaveLength(4);

    let s = passSetup(engine, state, playerIds);
    s = playOneRound(engine, s, playerIds);
    expect(s.phase).toBe('restructuring');
    expect(s.round).toBe(2);
  });

  it('plays 2 consecutive rounds', () => {
    const { engine, state, playerIds } = createTestGame({ playerCount: 4 });
    let s = passSetup(engine, state, playerIds);

    for (let round = 1; round <= 2; round++) {
      expect(s.round).toBe(round);
      s = playOneRound(engine, s, playerIds);
    }
    expect(s.round).toBe(3);
  });
});

describe('5-player game', () => {
  it('completes full round', () => {
    const { engine, state, playerIds } = createTestGame({ playerCount: 5 });
    expect(state.players).toHaveLength(5);

    let s = passSetup(engine, state, playerIds);
    s = playOneRound(engine, s, playerIds);
    expect(s.phase).toBe('restructuring');
    expect(s.round).toBe(2);
  });

  it('working sub-phases cycle through all 5 players', () => {
    const { engine, state, playerIds } = createTestGame({ playerCount: 5 });
    let s = passSetup(engine, state, playerIds);
    s = passRestructuring(engine, s, playerIds);
    s = passOrderOfBusiness(engine, s);
    expect(s.phase).toBe('working_9_to_5');
    expect(s.workingSubPhase).toBe('hire');

    // In hire sub-phase, each of the 5 players should get a turn to skip
    const acted: string[] = [];
    while (s.phase === 'working_9_to_5' && s.workingSubPhase === 'hire') {
      acted.push(activeId(s));
      s = engine.processAction(s, activeId(s), { type: 'skip_hire' });
    }
    expect(acted).toHaveLength(5);
    // All unique player IDs
    expect(new Set(acted).size).toBe(5);
  });
});

describe('bank reserve', () => {
  it('works with 3 players', () => {
    const { engine, state, playerIds } = createTestGame({ playerCount: 3, useBankReserve: true });
    const values = [100, 200, 300] as const;
    let s = state;
    for (let i = 0; i < 3; i++) {
      s = engine.processAction(s, playerIds[i], { type: 'choose_bank_reserve', value: values[i] });
      expect(s.players.find(p => p.id === playerIds[i])!.bankReserveCard!.value).toBe(values[i]);
    }
  });
});

describe('game over', () => {
  it('rejects actions after game over', () => {
    const { engine, state } = createTestGame();
    const overState: GameState = { ...state, phase: 'game_over' };
    expect(() => {
      engine.processAction(overState, P1, { type: 'pass_starting_restaurant' });
    }).toThrow('Game is already over');
  });
});
