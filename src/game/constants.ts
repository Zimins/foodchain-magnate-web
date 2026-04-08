import { EmployeeDefinition, EmployeeType, MilestoneId, BankReserveCard } from './types';

// ============================================================
// Employee Definitions
// ============================================================

export const EMPLOYEE_DEFINITIONS: Record<EmployeeType, EmployeeDefinition> = {
  ceo: {
    type: 'ceo', displayName: 'Chief Executive Officer', isEntryLevel: false,
    hasSalary: false, workSlots: 3, isUnique: false, roadRange: 0, airRange: 0,
    trainingOptions: [], category: 'ceo',
  },
  // ---- Management ----
  management_trainee: {
    type: 'management_trainee', displayName: 'Management Trainee', isEntryLevel: true,
    hasSalary: false, workSlots: 1, isUnique: false, roadRange: 0, airRange: 0,
    trainingOptions: ['junior_vice_president', 'recruiting_manager', 'coach', 'local_manager', 'new_business_developer', 'discount_manager', 'pricing_manager', 'waitress'],
    category: 'management',
  },
  junior_vice_president: {
    type: 'junior_vice_president', displayName: 'Junior Vice President', isEntryLevel: false,
    hasSalary: true, workSlots: 2, isUnique: false, roadRange: 0, airRange: 0,
    trainingOptions: ['vice_president'], category: 'management',
  },
  vice_president: {
    type: 'vice_president', displayName: 'Vice President', isEntryLevel: false,
    hasSalary: true, workSlots: 3, isUnique: false, roadRange: 0, airRange: 0,
    trainingOptions: ['senior_vice_president'], category: 'management',
  },
  senior_vice_president: {
    type: 'senior_vice_president', displayName: 'Senior Vice President', isEntryLevel: false,
    hasSalary: true, workSlots: 2, isUnique: false, roadRange: 0, airRange: 0,
    trainingOptions: ['executive_vice_president'], category: 'management',
  },
  executive_vice_president: {
    type: 'executive_vice_president', displayName: 'Executive Vice President', isEntryLevel: false,
    hasSalary: true, workSlots: 1, isUnique: false, roadRange: 0, airRange: 0,
    trainingOptions: [], category: 'management',
  },
  // ---- Recruiters ----
  recruiting_girl: {
    type: 'recruiting_girl', displayName: 'Recruiting Girl', isEntryLevel: true,
    hasSalary: false, workSlots: 0, isUnique: false, roadRange: 0, airRange: 0,
    trainingOptions: ['recruiting_manager'], category: 'recruiter',
  },
  recruiting_manager: {
    type: 'recruiting_manager', displayName: 'Recruiting Manager', isEntryLevel: false,
    hasSalary: true, workSlots: 0, isUnique: false, roadRange: 0, airRange: 0,
    trainingOptions: ['hr_director'], category: 'recruiter',
  },
  hr_director: {
    type: 'hr_director', displayName: 'HR Director', isEntryLevel: false,
    hasSalary: true, workSlots: 0, isUnique: true, roadRange: 0, airRange: 0,
    trainingOptions: [], category: 'recruiter',
  },
  // ---- Trainers ----
  trainer: {
    type: 'trainer', displayName: 'Trainer', isEntryLevel: true,
    hasSalary: false, workSlots: 0, isUnique: false, roadRange: 0, airRange: 0,
    trainingOptions: ['coach'], category: 'trainer',
  },
  coach: {
    type: 'coach', displayName: 'Coach', isEntryLevel: false,
    hasSalary: true, workSlots: 0, isUnique: false, roadRange: 0, airRange: 0,
    trainingOptions: ['guru'], category: 'trainer',
  },
  guru: {
    type: 'guru', displayName: 'Guru', isEntryLevel: false,
    hasSalary: true, workSlots: 0, isUnique: true, roadRange: 0, airRange: 0,
    trainingOptions: [], category: 'trainer',
  },
  // ---- Planning ----
  local_manager: {
    type: 'local_manager', displayName: 'Local Manager', isEntryLevel: false,
    hasSalary: true, workSlots: 0, isUnique: false, roadRange: 3, airRange: 0,
    trainingOptions: ['regional_manager'], category: 'planning',
  },
  regional_manager: {
    type: 'regional_manager', displayName: 'Regional Manager', isEntryLevel: false,
    hasSalary: true, workSlots: 0, isUnique: true, roadRange: -1, airRange: 0,
    trainingOptions: [], category: 'planning',
  },
  // ---- Marketing ----
  marketing_trainee: {
    type: 'marketing_trainee', displayName: 'Marketing Trainee', isEntryLevel: true,
    hasSalary: false, workSlots: 0, isUnique: false, roadRange: 2, airRange: 0,
    trainingOptions: ['campaign_manager'], category: 'marketing',
  },
  campaign_manager: {
    type: 'campaign_manager', displayName: 'Campaign Manager', isEntryLevel: false,
    hasSalary: true, workSlots: 0, isUnique: false, roadRange: 3, airRange: 0,
    trainingOptions: ['brand_manager'], category: 'marketing',
  },
  brand_manager: {
    type: 'brand_manager', displayName: 'Brand Manager', isEntryLevel: false,
    hasSalary: true, workSlots: 0, isUnique: false, roadRange: 4, airRange: 0,
    trainingOptions: ['brand_director'], category: 'marketing',
  },
  brand_director: {
    type: 'brand_director', displayName: 'Brand Director', isEntryLevel: false,
    hasSalary: true, workSlots: 0, isUnique: true, roadRange: 5, airRange: -1,
    trainingOptions: [], category: 'marketing',
  },
  // ---- Pricing ----
  pricing_manager: {
    type: 'pricing_manager', displayName: 'Pricing Manager', isEntryLevel: false,
    hasSalary: true, workSlots: 0, isUnique: false, roadRange: 0, airRange: 0,
    trainingOptions: [], category: 'pricing',
  },
  discount_manager: {
    type: 'discount_manager', displayName: 'Discount Manager', isEntryLevel: false,
    hasSalary: true, workSlots: 0, isUnique: false, roadRange: 0, airRange: 0,
    trainingOptions: ['luxuries_manager'], category: 'pricing',
  },
  luxuries_manager: {
    type: 'luxuries_manager', displayName: 'Luxuries Manager', isEntryLevel: false,
    hasSalary: true, workSlots: 0, isUnique: true, roadRange: 0, airRange: 0,
    trainingOptions: [], category: 'pricing',
  },
  // ---- Kitchen ----
  kitchen_trainee: {
    type: 'kitchen_trainee', displayName: 'Kitchen Trainee', isEntryLevel: true,
    hasSalary: false, workSlots: 0, isUnique: false, roadRange: 0, airRange: 0,
    trainingOptions: ['burger_cook', 'pizza_cook'], category: 'kitchen',
  },
  burger_cook: {
    type: 'burger_cook', displayName: 'Burger Cook', isEntryLevel: false,
    hasSalary: true, workSlots: 0, isUnique: false, roadRange: 0, airRange: 0,
    trainingOptions: ['burger_chef'], category: 'kitchen',
  },
  burger_chef: {
    type: 'burger_chef', displayName: 'Burger Chef', isEntryLevel: false,
    hasSalary: true, workSlots: 0, isUnique: true, roadRange: 0, airRange: 0,
    trainingOptions: [], category: 'kitchen',
  },
  pizza_cook: {
    type: 'pizza_cook', displayName: 'Pizza Cook', isEntryLevel: false,
    hasSalary: true, workSlots: 0, isUnique: false, roadRange: 0, airRange: 0,
    trainingOptions: ['pizza_chef'], category: 'kitchen',
  },
  pizza_chef: {
    type: 'pizza_chef', displayName: 'Pizza Chef', isEntryLevel: false,
    hasSalary: true, workSlots: 0, isUnique: true, roadRange: 0, airRange: 0,
    trainingOptions: [], category: 'kitchen',
  },
  // ---- Drink Collectors ----
  errand_boy: {
    type: 'errand_boy', displayName: 'Errand Boy', isEntryLevel: true,
    hasSalary: false, workSlots: 0, isUnique: false, roadRange: 0, airRange: 0,
    trainingOptions: ['cart_operator'], category: 'drink',
  },
  cart_operator: {
    type: 'cart_operator', displayName: 'Cart Operator', isEntryLevel: false,
    hasSalary: true, workSlots: 0, isUnique: false, roadRange: 2, airRange: 0,
    trainingOptions: ['truck_driver'], category: 'drink',
  },
  truck_driver: {
    type: 'truck_driver', displayName: 'Truck Driver', isEntryLevel: false,
    hasSalary: true, workSlots: 0, isUnique: false, roadRange: 3, airRange: 0,
    trainingOptions: ['zeppelin_pilot'], category: 'drink',
  },
  zeppelin_pilot: {
    type: 'zeppelin_pilot', displayName: 'Zeppelin Pilot', isEntryLevel: false,
    hasSalary: true, workSlots: 0, isUnique: true, roadRange: 0, airRange: 3,
    trainingOptions: [], category: 'drink',
  },
  // ---- Special ----
  waitress: {
    type: 'waitress', displayName: 'Waitress', isEntryLevel: false,
    hasSalary: true, workSlots: 0, isUnique: false, roadRange: 0, airRange: 0,
    trainingOptions: [], category: 'special',
  },
  new_business_developer: {
    type: 'new_business_developer', displayName: 'New Business Developer', isEntryLevel: false,
    hasSalary: true, workSlots: 0, isUnique: false, roadRange: -1, airRange: 0,
    trainingOptions: [], category: 'special',
  },
  cfo: {
    type: 'cfo', displayName: 'CFO', isEntryLevel: false,
    hasSalary: true, workSlots: 0, isUnique: true, roadRange: 0, airRange: 0,
    trainingOptions: [], category: 'special',
  },
};

// ============================================================
// Employee Supply Counts (for 3 players)
// ============================================================

export function getInitialEmployeeSupply(playerCount: number): Record<EmployeeType, number> {
  const uniqueCount = playerCount <= 3 ? 1 : playerCount <= 4 ? 2 : 3;
  return {
    ceo: 0, // CEOs are given directly to players
    management_trainee: 12,
    junior_vice_president: 6,
    vice_president: 3,
    senior_vice_president: 3,
    executive_vice_president: 3,
    recruiting_girl: 12,
    recruiting_manager: 6,
    hr_director: uniqueCount,
    trainer: 12,
    coach: 6,
    guru: uniqueCount,
    local_manager: 6,
    regional_manager: uniqueCount,
    marketing_trainee: 12,
    campaign_manager: 6,
    brand_manager: 3,
    brand_director: uniqueCount,
    pricing_manager: 6,
    discount_manager: 6,
    luxuries_manager: uniqueCount,
    kitchen_trainee: 12,
    burger_cook: 6,
    burger_chef: uniqueCount,
    pizza_cook: 6,
    pizza_chef: uniqueCount,
    errand_boy: 12,
    cart_operator: 6,
    truck_driver: 3,
    zeppelin_pilot: uniqueCount,
    waitress: 6,
    new_business_developer: 6,
    cfo: 0, // only from milestone
  };
}

// ============================================================
// Marketer Capabilities
// ============================================================

export const MARKETER_CAPABILITIES: Record<string, { campaigns: CampaignType[]; maxDuration: number }> = {
  marketing_trainee: { campaigns: ['billboard'], maxDuration: 2 },
  campaign_manager: { campaigns: ['billboard', 'mailbox'], maxDuration: 3 },
  brand_manager: { campaigns: ['billboard', 'mailbox', 'airplane'], maxDuration: 4 },
  brand_director: { campaigns: ['billboard', 'mailbox', 'airplane', 'radio'], maxDuration: 5 },
};

import { CampaignType } from './types';

// ============================================================
// Kitchen Production
// ============================================================

export const KITCHEN_PRODUCTION: Record<string, { type: FoodType | 'choice'; amount: number }> = {
  kitchen_trainee: { type: 'choice', amount: 1 },
  burger_cook: { type: 'burger', amount: 3 },
  burger_chef: { type: 'burger', amount: 8 },
  pizza_cook: { type: 'pizza', amount: 3 },
  pizza_chef: { type: 'pizza', amount: 8 },
};

import { FoodType } from './types';

// ============================================================
// Drink Collection
// ============================================================

export const DRINK_COLLECTION = {
  errand_boy: { perSupplier: 1, needsRoute: false },
  cart_operator: { perSupplier: 2, needsRoute: true },
  truck_driver: { perSupplier: 3, needsRoute: true },
  zeppelin_pilot: { perSupplier: 2, needsRoute: true, isAir: true },
};

// ============================================================
// Game Setup Constants
// ============================================================

export const SETUP_BY_PLAYER_COUNT: Record<number, {
  mapRows: number;
  mapCols: number;
  startingBank: number;
  removeBillboards: number[];
}> = {
  2: { mapRows: 3, mapCols: 3, startingBank: 100, removeBillboards: [12, 15, 16] },
  3: { mapRows: 3, mapCols: 4, startingBank: 150, removeBillboards: [15, 16] },
  4: { mapRows: 4, mapCols: 4, startingBank: 200, removeBillboards: [16] },
  5: { mapRows: 4, mapCols: 5, startingBank: 250, removeBillboards: [] },
};

export const PLAYER_COLORS: PlayerColor[] = ['yellow', 'blue', 'red', 'green', 'purple'];

import { PlayerColor } from './types';

export const BANK_RESERVE_CARDS: BankReserveCard[] = [
  { value: 100, ceoSlots: 2 },
  { value: 200, ceoSlots: 3 },
  { value: 300, ceoSlots: 4 },
];

export const BASE_ITEM_PRICE = 10;
export const SALARY_AMOUNT = 5;
export const WAITRESS_BONUS = 3;
export const WAITRESS_MILESTONE_BONUS = 5;
export const CFO_BONUS_PERCENT = 50;
export const MAX_RESTAURANTS_PER_PLAYER = 3;
export const MAX_DEMAND_NORMAL = 3;
export const MAX_DEMAND_GARDEN = 5;
export const FREEZER_CAPACITY = 10;

// ============================================================
// Milestone Definitions
// ============================================================

export interface MilestoneDefinition {
  id: MilestoneId;
  displayName: string;
  description: string;
}

export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  { id: 'first_to_train', displayName: 'First to Train an Employee', description: 'Salary -$15 permanently' },
  { id: 'first_to_hire_3', displayName: 'First to Hire 3 in 1 Turn', description: 'Immediately hire 2 Management Trainees' },
  { id: 'first_to_pay_20_salaries', displayName: 'First to Pay $20+ Salaries', description: 'Multiple trainers can train same employee' },
  { id: 'first_waitress_played', displayName: 'First Waitress Played', description: 'Waitress bonus +$2 → +$5' },
  { id: 'first_to_have_20', displayName: 'First to Have $20', description: 'View face-down reserve cards' },
  { id: 'first_to_have_100', displayName: 'First to Have $100', description: 'CEO acts as CFO (50% bonus)' },
  { id: 'first_errand_boy_played', displayName: 'First Errand Boy Played', description: 'Errand Boys collect 2, others +1/supplier' },
  { id: 'first_cart_operator_played', displayName: 'First Cart Operator Played', description: 'Cart Op/Truck/Zeppelin +1 Range' },
  { id: 'first_burger_produced', displayName: 'First Burger Produced', description: 'Gain a free Burger Cook' },
  { id: 'first_pizza_produced', displayName: 'First Pizza Produced', description: 'Gain a free Pizza Cook' },
  { id: 'first_to_throw_away', displayName: 'First to Throw Away Food/Drink', description: 'Gain freezer, store up to 10 items' },
  { id: 'first_to_lower_prices', displayName: 'First to Lower Prices', description: 'Item price permanently -$1' },
  { id: 'first_burger_marketed', displayName: 'First Burger Marketed', description: '+$5 per burger sold' },
  { id: 'first_pizza_marketed', displayName: 'First Pizza Marketed', description: '+$5 per pizza sold' },
  { id: 'first_drink_marketed', displayName: 'First Drink Marketed', description: '+$5 per drink sold' },
  { id: 'first_billboard_campaign', displayName: 'First Billboard Campaign', description: 'All campaigns eternal, no marketer salary' },
  { id: 'first_airplane_campaign', displayName: 'First Airplane Campaign', description: '+2 open Work Slots for turn order' },
  { id: 'first_radio_campaign', displayName: 'First Radio Campaign', description: 'Radio campaigns place 2 demand per house' },
];

// ============================================================
// Default Map Tile (uniform for initial implementation)
// ============================================================

/**
 * Standard 5x5 map tile used for all positions.
 * Layout:
 * R R R R R    (R=road, .=empty, H=house, S=soda supplier)
 * R . . . R
 * R . H . R    House in center
 * R . . . R
 * R R R R R
 *
 * Drink suppliers placed on specific tiles only.
 */
export function createStandardMapTile(tileId: number, houseNumber?: number, drinkType?: 'soda' | 'lemonade' | 'beer'): MapTile {
  const grid: MapSquare[][] = [];
  for (let r = 0; r < 5; r++) {
    const row: MapSquare[] = [];
    for (let c = 0; c < 5; c++) {
      const isEdge = r === 0 || r === 4 || c === 0 || c === 4;
      if (isEdge) {
        row.push({ type: 'road' });
      } else if (r === 2 && c === 2 && houseNumber !== undefined) {
        row.push({ type: 'house', houseNumber });
      } else if (r === 2 && c === 3 && drinkType) {
        row.push({ type: 'drink_supplier', drinkType });
      } else {
        row.push({ type: 'empty' });
      }
    }
    grid.push(row);
  }
  return { id: tileId, grid, rotation: 0 };
}

import { MapTile, MapSquare } from './types';

// Generate standard map for a given player count
export function generateStandardMap(playerCount: number): { tiles: MapTile[][]; houses: HouseState[] } {
  const setup = SETUP_BY_PLAYER_COUNT[playerCount];
  const tiles: MapTile[][] = [];
  const houses: HouseState[] = [];
  const drinkTypes: ('soda' | 'lemonade' | 'beer')[] = ['soda', 'lemonade', 'beer'];

  let tileId = 1;
  let houseNum = 1;
  let drinkIdx = 0;

  for (let r = 0; r < setup.mapRows; r++) {
    const row: MapTile[] = [];
    for (let c = 0; c < setup.mapCols; c++) {
      // Place drink suppliers on first 3 tiles
      const drinkType = drinkIdx < 3 ? drinkTypes[drinkIdx] : undefined;
      if (drinkIdx < 3) drinkIdx++;

      const tile = createStandardMapTile(tileId, houseNum, drinkType);
      row.push(tile);

      // Register the house
      houses.push({
        number: houseNum,
        position: { row: r * 5 + 2, col: c * 5 + 2 },
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

import { HouseState } from './types';
