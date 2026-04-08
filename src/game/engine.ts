import { v4 as uuidv4 } from 'uuid';
import type {
  GameState,
  GameConfig,
  GameAction,
  GamePhase,
  PlayerState,
  PlayerColor,
  EmployeeType,
  MilestoneId,
  MapTile,
  HouseState,
} from './types';
import {
  getInitialEmployeeSupply,
  generateStandardMap,
  PLAYER_COLORS,
  SETUP_BY_PLAYER_COUNT,
  BANK_RESERVE_CARDS,
} from './constants';
import { processSetupAction } from './phases/setup';
import { processRestructuringAction } from './phases/restructuring';
import { processOrderOfBusinessAction, initializeOrderOfBusiness } from './phases/orderOfBusiness';
import { processWorkingAction } from './phases/working';
import { processDinnertime } from './phases/dinnertime';
import { processPaydayAction } from './phases/payday';
import { processMarketing } from './phases/marketing';
import { processCleanup } from './phases/cleanup';

export interface PlayerSetupInfo {
  id: string;
  name: string;
  color: PlayerColor;
}

const ALL_MILESTONE_IDS: MilestoneId[] = [
  'first_to_train', 'first_to_hire_3', 'first_to_pay_20_salaries',
  'first_waitress_played', 'first_to_have_20', 'first_to_have_100',
  'first_errand_boy_played', 'first_cart_operator_played',
  'first_burger_produced', 'first_pizza_produced',
  'first_to_throw_away', 'first_to_lower_prices',
  'first_burger_marketed', 'first_pizza_marketed', 'first_drink_marketed',
  'first_billboard_campaign', 'first_airplane_campaign', 'first_radio_campaign',
];

export class GameEngine {
  createGame(
    config: GameConfig,
    playerInfos: PlayerSetupInfo[],
    mapOverride?: { tiles: MapTile[][]; houses: HouseState[] },
  ): GameState {
    const setup = SETUP_BY_PLAYER_COUNT[config.playerCount];
    const { tiles, houses } = mapOverride ?? generateStandardMap(config.playerCount);

    const players: PlayerState[] = playerInfos.map((info, index) => ({
      id: info.id,
      name: info.name,
      color: info.color,
      employees: [
        {
          card: { id: uuidv4(), type: 'ceo' as EmployeeType },
          location: 'hand' as const,
        },
      ],
      cash: 0,
      stock: { burger: 0, pizza: 0, soda: 0, lemonade: 0, beer: 0 },
      companyStructure: null,
      bankReserveCard: config.useBankReserve ? BANK_RESERVE_CARDS[0] : null,
      milestones: [] as MilestoneId[],
      turnOrder: index + 1,
      restaurants: [],
      ceoSlotCount: config.useBankReserve ? BANK_RESERVE_CARDS[0].ceoSlots : 3,
      itemPrice: 10,
      freezer: [],
      hasFreezer: false,
      isReady: false,
      isConnected: true,
    }));

    const turnOrderTrack: (string | null)[] = new Array(config.playerCount).fill(null);
    players.forEach((p, i) => {
      turnOrderTrack[i] = p.id;
    });

    return {
      id: uuidv4(),
      config,
      phase: 'setup',
      round: 1,
      players,
      activePlayerIndex: 0,
      mapTiles: tiles,
      mapRows: setup.mapRows,
      mapCols: setup.mapCols,
      houses,
      campaigns: [],
      milestones: config.useMilestones
        ? ALL_MILESTONE_IDS.map(id => ({ id, achievedBy: [], available: true }))
        : [],
      bank: setup.startingBank,
      bankBrokenCount: 0,
      bankReserveRevealed: false,
      employeeSupply: getInitialEmployeeSupply(config.playerCount),
      campaignSupply: {
        billboard: Array.from({ length: 16 }, (_, i) => i + 1).filter(
          n => !setup.removeBillboards.includes(n)
        ),
        mailbox: Array.from({ length: 8 }, (_, i) => i + 1),
        airplane: Array.from({ length: 4 }, (_, i) => i + 1),
        radio: Array.from({ length: 4 }, (_, i) => i + 1),
      },
      nextCampaignNumber: 1,
      turnOrderTrack,
      log: [
        {
          timestamp: Date.now(),
          message: 'Game created',
          phase: 'setup' as const,
        },
      ],
    };
  }

  processAction(state: GameState, playerId: string, action: GameAction): GameState {
    // Validate game is not over
    if (state.phase === 'game_over') {
      throw new Error('Game is already over');
    }

    // Validate player exists
    const player = state.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    // Validate it's the player's turn (for sequential phases)
    if (this.isSequentialPhase(state.phase)) {
      const activePlayer = state.players[state.activePlayerIndex];
      if (activePlayer.id !== playerId) {
        throw new Error('Not your turn');
      }
    }

    // Dispatch to appropriate phase handler
    let newState: GameState;

    switch (state.phase) {
      case 'setup':
        newState = processSetupAction(state, playerId, action);
        break;

      case 'restructuring':
        newState = processRestructuringAction(state, playerId, action);
        break;

      case 'order_of_business':
        newState = processOrderOfBusinessAction(state, playerId, action);
        break;

      case 'working_9_to_5':
        newState = processWorkingAction(state, playerId, action);
        break;

      case 'payday':
        newState = processPaydayAction(state, playerId, action);
        break;

      default:
        throw new Error(`Phase ${state.phase} does not accept player actions`);
    }

    // Process automatic phases
    newState = this.processAutomaticPhases(newState, state.phase);

    return newState;
  }

  /** Process phases that are fully automatic (no player input) */
  private processAutomaticPhases(state: GameState, previousPhase: GamePhase): GameState {
    let current = state;

    // Process automatic phases in sequence
    while (this.isAutomaticPhase(current.phase)) {
      switch (current.phase) {
        case 'dinnertime':
          current = processDinnertime(current);
          break;
        case 'marketing':
          current = processMarketing(current);
          break;
        case 'cleanup':
          current = processCleanup(current);
          break;
        default:
          return current;
      }
    }

    // Initialize order of business when entering it from restructuring
    if (current.phase === 'order_of_business' && previousPhase === 'restructuring') {
      current = initializeOrderOfBusiness(current);
    }

    return current;
  }

  /** Check if a phase requires sequential player turns */
  private isSequentialPhase(phase: GamePhase): boolean {
    return phase === 'order_of_business' || phase === 'working_9_to_5';
  }

  /** Check if a phase is fully automatic (no player input needed) */
  private isAutomaticPhase(phase: GamePhase): boolean {
    return phase === 'dinnertime' || phase === 'marketing' || phase === 'cleanup';
  }

  /** Get valid actions for a player in the current state */
  getValidActions(state: GameState, playerId: string): string[] {
    const player = state.players.find(p => p.id === playerId);
    if (!player) return [];

    switch (state.phase) {
      case 'setup':
        if (player.restaurants.length === 0) {
          return ['place_starting_restaurant', 'pass_starting_restaurant', 'choose_bank_reserve'];
        }
        return [];

      case 'restructuring':
        return player.isReady ? [] : ['submit_restructuring'];

      case 'order_of_business':
        if (state.players[state.activePlayerIndex]?.id !== playerId) return [];
        return ['choose_turn_order'];

      case 'working_9_to_5':
        if (state.players[state.activePlayerIndex]?.id !== playerId) return [];
        return getWorkingSubPhaseActions(state);

      case 'payday':
        return player.isReady ? [] : ['fire_employees', 'done_firing'];

      default:
        return [];
    }
  }
}

function getWorkingSubPhaseActions(state: GameState): string[] {
  switch (state.workingSubPhase) {
    case 'hire': return ['hire_employee', 'skip_hire'];
    case 'train': return ['train_employee', 'skip_train'];
    case 'launch_campaigns': return ['launch_campaign', 'skip_campaigns'];
    case 'prep_food_drinks': return ['produce_food', 'collect_drink', 'skip_prep'];
    case 'place_houses_gardens': return ['place_house', 'add_garden', 'skip_houses'];
    case 'place_move_restaurants': return ['place_restaurant', 'move_restaurant', 'skip_restaurants'];
    default: return [];
  }
}
