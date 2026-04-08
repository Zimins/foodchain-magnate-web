// ============================================================
// Food Chain Magnate - Core Type Definitions
// ============================================================

// ---- Enums & Literals ----

export type PlayerColor = 'yellow' | 'blue' | 'red' | 'green' | 'purple';

export type FoodType = 'burger' | 'pizza';
export type DrinkType = 'soda' | 'lemonade' | 'beer';
export type ItemType = FoodType | DrinkType;

export type CampaignType = 'billboard' | 'mailbox' | 'airplane' | 'radio';

export type GamePhase =
  | 'setup'
  | 'restructuring'
  | 'order_of_business'
  | 'working_9_to_5'
  | 'dinnertime'
  | 'payday'
  | 'marketing'
  | 'cleanup'
  | 'game_over';

export type WorkingSubPhase =
  | 'hire'
  | 'train'
  | 'open_drive_ins'
  | 'launch_campaigns'
  | 'prep_food_drinks'
  | 'place_houses_gardens'
  | 'place_move_restaurants';

// ---- Employee System ----

export type EmployeeType =
  // CEO
  | 'ceo'
  // Management line
  | 'management_trainee'
  | 'junior_vice_president'
  | 'vice_president'
  | 'senior_vice_president'
  | 'executive_vice_president'
  // Recruiters
  | 'recruiting_girl'
  | 'recruiting_manager'
  | 'hr_director'
  // Trainers
  | 'trainer'
  | 'coach'
  | 'guru'
  // Planning
  | 'local_manager'
  | 'regional_manager'
  // Marketing
  | 'marketing_trainee'
  | 'campaign_manager'
  | 'brand_manager'
  | 'brand_director'
  // Pricing
  | 'pricing_manager'
  | 'discount_manager'
  | 'luxuries_manager'
  // Kitchen
  | 'kitchen_trainee'
  | 'burger_cook'
  | 'burger_chef'
  | 'pizza_cook'
  | 'pizza_chef'
  // Drink collectors
  | 'errand_boy'
  | 'cart_operator'
  | 'truck_driver'
  | 'zeppelin_pilot'
  // Special
  | 'waitress'
  | 'new_business_developer'
  | 'cfo';

export interface EmployeeCard {
  id: string;
  type: EmployeeType;
}

export type EmployeeLocation = 'hand' | 'work_slot' | 'on_the_beach' | 'busy';

export interface EmployeeState {
  card: EmployeeCard;
  location: EmployeeLocation;
  /** For busy marketeers, which campaign they're running */
  busyCampaignId?: string;
}

export interface EmployeeDefinition {
  type: EmployeeType;
  displayName: string;
  isEntryLevel: boolean;
  hasSalary: boolean;
  workSlots: number;
  isUnique: boolean;
  /** Road range number, -1 for unlimited, 0 for N/A */
  roadRange: number;
  /** Air range number, -1 for unlimited, 0 for N/A */
  airRange: number;
  trainingOptions: EmployeeType[];
  category: 'management' | 'recruiter' | 'trainer' | 'planning' | 'marketing' | 'pricing' | 'kitchen' | 'drink' | 'special' | 'ceo';
}

// ---- Map System ----

export type SquareType =
  | 'empty'
  | 'road'
  | 'house'
  | 'apartment'
  | 'garden'
  | 'drink_supplier'
  | 'restaurant'
  | 'campaign'
  | 'bridge'
  | 'cul_de_sac'
  | 'park';

export type DrinkSupplierType = DrinkType;

export type BridgeDirection = 'horizontal' | 'vertical';

/** Direction the open side faces */
export type OpenDirection = 'north' | 'south' | 'east' | 'west';

export interface MapSquare {
  type: SquareType;
  /** For houses: house number */
  houseNumber?: number;
  /** For drink suppliers */
  drinkType?: DrinkSupplierType;
  /** For bridges: passable direction (horizontal = east-west, vertical = north-south) */
  bridgeDirection?: BridgeDirection;
  /** For cul-de-sacs: which side is open (connected to other roads) */
  openDirection?: OpenDirection;
  /** For restaurants: owner player id */
  ownerPlayerId?: string;
  /** For restaurants: entrance corner position */
  isEntranceCorner?: boolean;
  /** Restaurant state */
  restaurantState?: 'coming_soon' | 'open';
  /** Drive-in active */
  hasDriveIn?: boolean;
  /** Garden belongs to which house number */
  gardenForHouse?: number;
  /** For campaigns */
  campaignId?: string;
}

/** A single map tile (5x5 grid of squares) */
export interface MapTile {
  id: number;
  /** 5x5 grid - row-major order */
  grid: MapSquare[][];
  /** Rotation: 0, 90, 180, 270 degrees */
  rotation: 0 | 90 | 180 | 270;
}

/** Position on the full game map */
export interface MapPosition {
  /** Tile row in the grid of tiles */
  tileRow: number;
  /** Tile col in the grid of tiles */
  tileCol: number;
  /** Row within the tile (0-4) */
  row: number;
  /** Col within the tile (0-4) */
  col: number;
}

/** Global position as absolute coordinates */
export interface AbsolutePosition {
  row: number;
  col: number;
}

// ---- Campaign System ----

export interface Campaign {
  id: string;
  type: CampaignType;
  /** Which item this campaign advertises */
  itemType: ItemType;
  /** Remaining duration counters */
  duration: number;
  /** Is this an eternal campaign */
  isEternal: boolean;
  /** Position on the map */
  position: AbsolutePosition;
  /** Owner player id */
  ownerPlayerId: string;
  /** Marketeer employee id running this campaign */
  marketeerEmployeeId: string;
  /** Campaign number for ordering */
  campaignNumber: number;
  /** For airplanes: size (1, 3, or 5) and orientation */
  airplaneSize?: 1 | 3 | 5;
  airplaneOrientation?: 'horizontal' | 'vertical';
}

// ---- Milestone System ----

export type MilestoneId =
  | 'first_to_train'
  | 'first_to_hire_3'
  | 'first_to_pay_20_salaries'
  | 'first_waitress_played'
  | 'first_to_have_20'
  | 'first_to_have_100'
  | 'first_errand_boy_played'
  | 'first_cart_operator_played'
  | 'first_burger_produced'
  | 'first_pizza_produced'
  | 'first_to_throw_away'
  | 'first_to_lower_prices'
  | 'first_burger_marketed'
  | 'first_pizza_marketed'
  | 'first_drink_marketed'
  | 'first_billboard_campaign'
  | 'first_airplane_campaign'
  | 'first_radio_campaign';

export interface MilestoneState {
  id: MilestoneId;
  /** Player IDs who achieved this milestone */
  achievedBy: string[];
  /** Whether this milestone is still available */
  available: boolean;
}

// ---- House System ----

export interface HouseState {
  number: number;
  position: AbsolutePosition;
  /** Size: 2x2 for regular houses */
  hasGarden: boolean;
  gardenPosition?: AbsolutePosition;
  /** Demand counters currently on this house */
  demand: ItemType[];
  /** Max demand: 3 normally, 5 with garden */
  maxDemand: number;
}

// ---- Bank Reserve ----

export type BankReserveValue = 100 | 200 | 300;

export interface BankReserveCard {
  value: BankReserveValue;
  /** Number of CEO slots shown on this card */
  ceoSlots: 2 | 3 | 4;
}

// ---- Company Structure ----

export interface WorkSlotNode {
  /** Employee in this slot (null if empty) */
  employeeId: string | null;
  /** Child work slots (from managers) */
  children: WorkSlotNode[];
}

export interface CompanyStructure {
  /** CEO is always at the root */
  ceoEmployeeId: string;
  /** Work slots directly under CEO */
  ceoSlots: WorkSlotNode[];
}

// ---- Player State ----

export interface PlayerState {
  id: string;
  name: string;
  color: PlayerColor;
  /** All employees owned by this player */
  employees: EmployeeState[];
  /** Cash on hand */
  cash: number;
  /** Food and drink stock */
  stock: Record<ItemType, number>;
  /** Company structure for this round */
  companyStructure: CompanyStructure | null;
  /** Chosen bank reserve card (hidden until first bank break) */
  bankReserveCard: BankReserveCard | null;
  /** Milestones achieved */
  milestones: MilestoneId[];
  /** Turn order position (1-based) */
  turnOrder: number;
  /** Restaurant positions on map */
  restaurants: RestaurantState[];
  /** Number of CEO work slots */
  ceoSlotCount: number;
  /** Item price (calculated each dinnertime) */
  itemPrice: number;
  /** Freezer: items stored */
  freezer: ItemType[];
  hasFreezer: boolean;
  /** Ready state for simultaneous phases */
  isReady: boolean;
  /** Is this player connected */
  isConnected: boolean;
}

export interface RestaurantState {
  id: string;
  /** Top-left position of the 2x2 restaurant */
  position: AbsolutePosition;
  /** Which corner is the entrance (relative: 'tl' | 'tr' | 'bl' | 'br') */
  entranceCorner: 'tl' | 'tr' | 'bl' | 'br';
  state: 'coming_soon' | 'open';
  hasDriveIn: boolean;
}

// ---- Game State ----

export interface GameState {
  id: string;
  /** Game configuration */
  config: GameConfig;
  /** Current phase */
  phase: GamePhase;
  /** Current sub-phase within Working 9-5 */
  workingSubPhase?: WorkingSubPhase;
  /** Current round number (1-based) */
  round: number;
  /** Players */
  players: PlayerState[];
  /** Active player index (for sequential phases) */
  activePlayerIndex: number;
  /** The full map grid of tiles */
  mapTiles: MapTile[][];
  /** Map dimensions in tiles */
  mapRows: number;
  mapCols: number;
  /** All houses on the map */
  houses: HouseState[];
  /** Active campaigns */
  campaigns: Campaign[];
  /** Milestone states */
  milestones: MilestoneState[];
  /** Bank */
  bank: number;
  bankBrokenCount: number;
  bankReserveRevealed: boolean;
  /** Employee supply (available to hire/train) */
  employeeSupply: Record<EmployeeType, number>;
  /** Campaign supply */
  campaignSupply: {
    billboard: number[];  // billboard numbers available
    mailbox: number[];
    airplane: number[];
    radio: number[];
  };
  /** Next campaign number to assign */
  nextCampaignNumber: number;
  /** Turn order track positions */
  turnOrderTrack: (string | null)[];
  /** Game log for events */
  log: GameLogEntry[];
  /** Winner (set when game_over) */
  winnerId?: string;
}

export interface GameConfig {
  playerCount: number;
  /** Use introductory rules */
  introductoryGame: boolean;
  /** Use milestones */
  useMilestones: boolean;
  /** Use bank reserve cards */
  useBankReserve: boolean;
}

export interface GameLogEntry {
  timestamp: number;
  playerId?: string;
  message: string;
  phase: GamePhase;
}

// ---- Actions (Player → Server) ----

export type GameAction =
  | { type: 'choose_ceo'; ceoId: string }
  | { type: 'choose_bank_reserve'; value: BankReserveValue }
  | { type: 'place_starting_restaurant'; position: AbsolutePosition; entranceCorner: 'tl' | 'tr' | 'bl' | 'br' }
  | { type: 'pass_starting_restaurant' }
  | { type: 'submit_restructuring'; workEmployeeIds: string[]; beachEmployeeIds: string[] }
  | { type: 'choose_turn_order'; position: number }
  | { type: 'hire_employee'; employeeType: EmployeeType }
  | { type: 'skip_hire' }
  | { type: 'train_employee'; employeeId: string; targetType: EmployeeType }
  | { type: 'skip_train' }
  | { type: 'launch_campaign'; marketeerEmployeeId: string; campaignType: CampaignType; position: AbsolutePosition; itemType: ItemType; duration: number; airplaneSize?: 1 | 3 | 5; airplaneOrientation?: 'horizontal' | 'vertical' }
  | { type: 'skip_campaigns' }
  | { type: 'produce_food'; employeeId: string; foodType: FoodType }
  | { type: 'collect_drink'; employeeId: string; drinkType?: DrinkType; route?: AbsolutePosition[] }
  | { type: 'skip_prep' }
  | { type: 'place_house'; position: AbsolutePosition; houseNumber: number; gardenPosition: AbsolutePosition }
  | { type: 'add_garden'; houseNumber: number; gardenPosition: AbsolutePosition }
  | { type: 'skip_houses' }
  | { type: 'place_restaurant'; position: AbsolutePosition; entranceCorner: 'tl' | 'tr' | 'bl' | 'br' }
  | { type: 'move_restaurant'; restaurantId: string; newPosition: AbsolutePosition; newEntranceCorner: 'tl' | 'tr' | 'bl' | 'br' }
  | { type: 'skip_restaurants' }
  | { type: 'fire_employees'; employeeIds: string[] }
  | { type: 'done_firing' }
  | { type: 'choose_freezer_items'; itemTypes: ItemType[] }
  | { type: 'end_working_phase' };

// ---- Socket Events ----

export interface ServerToClientEvents {
  game_state: (state: GameState) => void;
  game_error: (error: { message: string }) => void;
  player_joined: (player: { id: string; name: string }) => void;
  player_left: (playerId: string) => void;
  game_started: () => void;
  game_log: (entry: GameLogEntry) => void;
  room_info: (info: RoomInfo) => void;
}

export interface ClientToServerEvents {
  create_room: (config: GameConfig, playerName: string, callback: (roomId: string, playerId: string) => void) => void;
  join_room: (roomId: string, playerName: string, callback: (success: boolean, error?: string, playerId?: string) => void) => void;
  start_game: (callback: (success: boolean, error?: string) => void) => void;
  game_action: (action: GameAction, callback: (success: boolean, error?: string) => void) => void;
  leave_room: () => void;
  get_room_info: (callback: (info: RoomInfo | null, playerId: string | null) => void) => void;
}

export interface RoomInfo {
  id: string;
  config: GameConfig;
  players: { id: string; name: string; color: PlayerColor; isReady: boolean }[];
  hostId: string;
  gameStarted: boolean;
}
