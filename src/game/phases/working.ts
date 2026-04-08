import {
  GameState,
  GameAction,
  WorkingSubPhase,
  EmployeeType,
  EmployeeState,
  FoodType,
  DrinkType,
  ItemType,
  RestaurantState,
  Campaign,
  AbsolutePosition,
  CampaignType,
} from '../types';
import {
  EMPLOYEE_DEFINITIONS,
  KITCHEN_PRODUCTION,
  DRINK_COLLECTION,
  MARKETER_CAPABILITIES,
  MAX_RESTAURANTS_PER_PLAYER,
  MAX_DEMAND_NORMAL,
  MAX_DEMAND_GARDEN,
} from '../constants';
import {
  updatePlayer,
  addLog,
  generateId,
  getNextPlayerIndex,
  getFirstPlayerIndex,
  countWorkingOfType,
  getWorkingEmployeesOfType,
  hasMilestone,
} from '../utils';

const SUB_PHASE_ORDER: WorkingSubPhase[] = [
  'hire',
  'train',
  'open_drive_ins',
  'launch_campaigns',
  'prep_food_drinks',
  'place_houses_gardens',
  'place_move_restaurants',
];

/** Process working phase actions */
export function processWorkingAction(
  state: GameState,
  playerId: string,
  action: GameAction
): GameState {
  const subPhase = state.workingSubPhase;
  if (!subPhase) throw new Error('No working sub-phase set');

  switch (subPhase) {
    case 'hire': return processHire(state, playerId, action);
    case 'train': return processTrain(state, playerId, action);
    case 'open_drive_ins': return advanceSubPhase(state); // Simplified: auto-skip
    case 'launch_campaigns': return processCampaigns(state, playerId, action);
    case 'prep_food_drinks': return processPrepFoodDrinks(state, playerId, action);
    case 'place_houses_gardens': return processHousesGardens(state, playerId, action);
    case 'place_move_restaurants': return processRestaurants(state, playerId, action);
    default:
      throw new Error(`Unknown sub-phase: ${subPhase}`);
  }
}

// ---- Hire Sub-Phase ----

function processHire(state: GameState, playerId: string, action: GameAction): GameState {
  const player = state.players.find(p => p.id === playerId)!;

  if (action.type === 'skip_hire') {
    return advanceWorkingPlayer(state, playerId);
  }

  if (action.type !== 'hire_employee') {
    throw new Error(`Invalid action for hire sub-phase: ${action.type}`);
  }

  const empType = action.employeeType;
  const def = EMPLOYEE_DEFINITIONS[empType];

  // Must be entry-level to hire
  if (!def.isEntryLevel) {
    throw new Error('Can only hire entry-level employees');
  }

  // Check supply
  if (state.employeeSupply[empType] <= 0) {
    throw new Error('No more of this employee type in supply');
  }

  // Check recruiter capacity
  const recruitingGirls = countWorkingOfType(player, 'recruiting_girl');
  const recruitingManagers = countWorkingOfType(player, 'recruiting_manager');
  const hrDirectors = countWorkingOfType(player, 'hr_director');
  const hireCapacity = recruitingGirls + (recruitingManagers * 2) + (hrDirectors * 3);

  // Count already hired this turn (employees added this sub-phase)
  // For simplicity, allow hiring based on capacity
  if (hireCapacity <= 0) {
    throw new Error('No recruiting capacity');
  }

  const newEmployee: EmployeeState = {
    card: { id: generateId(), type: empType },
    location: 'hand',
  };

  let newState = updatePlayer(state, playerId, {
    employees: [...player.employees, newEmployee],
  });

  newState = {
    ...newState,
    employeeSupply: {
      ...newState.employeeSupply,
      [empType]: newState.employeeSupply[empType] - 1,
    },
  };

  newState = addLog(newState, `${player.name} hired a ${def.displayName}.`, playerId);

  // Check first_to_hire_3 milestone
  newState = checkHireMilestones(newState, playerId);

  return advanceWorkingPlayer(newState, playerId);
}

function checkHireMilestones(state: GameState, playerId: string): GameState {
  // Simplified: milestone check for hiring 3 in one turn would need tracking
  // across the sub-phase. For now, skip this milestone trigger.
  return state;
}

// ---- Train Sub-Phase ----

function processTrain(state: GameState, playerId: string, action: GameAction): GameState {
  if (action.type === 'skip_train') {
    return advanceWorkingPlayer(state, playerId);
  }

  if (action.type !== 'train_employee') {
    throw new Error(`Invalid action for train sub-phase: ${action.type}`);
  }

  const player = state.players.find(p => p.id === playerId)!;
  const employee = player.employees.find(e => e.card.id === action.employeeId);
  if (!employee) throw new Error('Employee not found');

  const def = EMPLOYEE_DEFINITIONS[employee.card.type];
  if (!def.trainingOptions.includes(action.targetType)) {
    throw new Error('Invalid training target');
  }

  // Check trainer capacity
  const trainers = countWorkingOfType(player, 'trainer');
  const coaches = countWorkingOfType(player, 'coach');
  const gurus = countWorkingOfType(player, 'guru');
  if (trainers + coaches + gurus <= 0) {
    throw new Error('No training capacity');
  }

  // Check supply of target type
  if (state.employeeSupply[action.targetType] <= 0) {
    throw new Error('No more of target employee type in supply');
  }

  // Replace employee with trained version
  const newEmployees = player.employees.map(e =>
    e.card.id === action.employeeId
      ? { ...e, card: { ...e.card, type: action.targetType } }
      : e
  );

  // Return old type to supply, take new from supply
  const newSupply = { ...state.employeeSupply };
  newSupply[employee.card.type] = (newSupply[employee.card.type] || 0) + 1;
  newSupply[action.targetType] = newSupply[action.targetType] - 1;

  let newState = updatePlayer(state, playerId, { employees: newEmployees });
  newState = { ...newState, employeeSupply: newSupply };

  const targetDef = EMPLOYEE_DEFINITIONS[action.targetType];
  newState = addLog(newState, `${player.name} trained ${def.displayName} → ${targetDef.displayName}.`, playerId);

  // Check first_to_train milestone
  newState = tryAwardMilestone(newState, playerId, 'first_to_train');

  return advanceWorkingPlayer(newState, playerId);
}

// ---- Campaigns Sub-Phase ----

function processCampaigns(state: GameState, playerId: string, action: GameAction): GameState {
  if (action.type === 'skip_campaigns') {
    return advanceWorkingPlayer(state, playerId);
  }

  if (action.type !== 'launch_campaign') {
    throw new Error(`Invalid action for campaigns sub-phase: ${action.type}`);
  }

  const player = state.players.find(p => p.id === playerId)!;
  const marketeer = player.employees.find(e => e.card.id === action.marketeerEmployeeId);
  if (!marketeer) throw new Error('Marketeer not found');

  const capabilities = MARKETER_CAPABILITIES[marketeer.card.type];
  if (!capabilities) throw new Error('Employee is not a marketeer');
  if (!capabilities.campaigns.includes(action.campaignType)) {
    throw new Error('Marketeer cannot run this campaign type');
  }

  // Get campaign number
  const supply = state.campaignSupply[action.campaignType];
  if (supply.length === 0) throw new Error('No campaigns of this type available');
  const campaignNumber = supply[0];

  const campaign: Campaign = {
    id: generateId(),
    type: action.campaignType,
    itemType: action.itemType,
    duration: action.duration,
    isEternal: hasMilestone(player, 'first_billboard_campaign'),
    position: action.position,
    ownerPlayerId: playerId,
    marketeerEmployeeId: action.marketeerEmployeeId,
    campaignNumber,
    airplaneSize: action.airplaneSize,
    airplaneOrientation: action.airplaneOrientation,
  };

  // Mark marketeer as busy
  const newEmployees = player.employees.map(e =>
    e.card.id === action.marketeerEmployeeId
      ? { ...e, location: 'busy' as const, busyCampaignId: campaign.id }
      : e
  );

  const newSupply = {
    ...state.campaignSupply,
    [action.campaignType]: supply.filter(n => n !== campaignNumber),
  };

  let newState: GameState = {
    ...state,
    campaigns: [...state.campaigns, campaign],
    campaignSupply: newSupply,
    nextCampaignNumber: state.nextCampaignNumber + 1,
  };

  newState = updatePlayer(newState, playerId, { employees: newEmployees });
  newState = addLog(newState, `${player.name} launched a ${action.campaignType} campaign for ${action.itemType}.`, playerId);

  // Check campaign milestones
  if (action.campaignType === 'billboard') {
    newState = tryAwardMilestone(newState, playerId, 'first_billboard_campaign');
  }
  if (action.campaignType === 'airplane') {
    newState = tryAwardMilestone(newState, playerId, 'first_airplane_campaign');
  }
  if (action.campaignType === 'radio') {
    newState = tryAwardMilestone(newState, playerId, 'first_radio_campaign');
  }

  // Check item marketing milestones
  if (action.itemType === 'burger') {
    newState = tryAwardMilestone(newState, playerId, 'first_burger_marketed');
  } else if (action.itemType === 'pizza') {
    newState = tryAwardMilestone(newState, playerId, 'first_pizza_marketed');
  } else {
    newState = tryAwardMilestone(newState, playerId, 'first_drink_marketed');
  }

  return advanceWorkingPlayer(newState, playerId);
}

// ---- Prep Food & Drinks Sub-Phase ----

function processPrepFoodDrinks(state: GameState, playerId: string, action: GameAction): GameState {
  if (action.type === 'skip_prep') {
    return advanceWorkingPlayer(state, playerId);
  }

  const player = state.players.find(p => p.id === playerId)!;

  if (action.type === 'produce_food') {
    const employee = player.employees.find(e => e.card.id === action.employeeId);
    if (!employee) throw new Error('Employee not found');

    const production = KITCHEN_PRODUCTION[employee.card.type];
    if (!production) throw new Error('Employee cannot produce food');

    const foodType = action.foodType;
    if (production.type !== 'choice' && production.type !== foodType) {
      throw new Error(`This employee can only produce ${production.type}`);
    }

    const newStock = { ...player.stock };
    newStock[foodType] = (newStock[foodType] || 0) + production.amount;

    let newState = updatePlayer(state, playerId, { stock: newStock });
    newState = addLog(newState, `${player.name} produced ${production.amount} ${foodType}(s).`, playerId);

    // Check food production milestones
    if (foodType === 'burger') {
      newState = tryAwardMilestone(newState, playerId, 'first_burger_produced');
    } else {
      newState = tryAwardMilestone(newState, playerId, 'first_pizza_produced');
    }

    return newState;
  }

  if (action.type === 'collect_drink') {
    const employee = player.employees.find(e => e.card.id === action.employeeId);
    if (!employee) throw new Error('Employee not found');

    const collection = DRINK_COLLECTION[employee.card.type as keyof typeof DRINK_COLLECTION];
    if (!collection) throw new Error('Employee cannot collect drinks');

    // Simplified: errand boys get 1 of any drink, others collect from suppliers
    let amount = collection.perSupplier;
    if (hasMilestone(player, 'first_errand_boy_played')) {
      if (employee.card.type === 'errand_boy') {
        amount = 2;
      } else {
        amount += 1;
      }
    }
    if (hasMilestone(player, 'first_cart_operator_played') && employee.card.type !== 'errand_boy') {
      // Range bonus handled elsewhere
    }

    const drinkType: DrinkType = action.drinkType || 'soda';
    const newStock = { ...player.stock };
    newStock[drinkType] = (newStock[drinkType] || 0) + amount;

    let newState = updatePlayer(state, playerId, { stock: newStock });
    newState = addLog(newState, `${player.name} collected ${amount} ${drinkType}(s).`, playerId);

    return newState;
  }

  throw new Error(`Invalid action for prep sub-phase: ${action.type}`);
}

// ---- Houses & Gardens Sub-Phase ----

function processHousesGardens(state: GameState, playerId: string, action: GameAction): GameState {
  if (action.type === 'skip_houses') {
    return advanceWorkingPlayer(state, playerId);
  }

  const player = state.players.find(p => p.id === playerId)!;

  if (action.type === 'place_house') {
    // Requires a New Business Developer
    const nbds = getWorkingEmployeesOfType(player, 'new_business_developer');
    if (nbds.length === 0) throw new Error('No New Business Developer available');

    const houseNumber = action.houseNumber;
    const newHouse = {
      number: houseNumber,
      position: action.position,
      hasGarden: true,
      gardenPosition: action.gardenPosition,
      demand: [] as ItemType[],
      maxDemand: MAX_DEMAND_GARDEN,
    };

    let newState: GameState = {
      ...state,
      houses: [...state.houses, newHouse],
    };
    newState = addLog(newState, `${player.name} placed house #${houseNumber} with garden.`, playerId);
    return advanceWorkingPlayer(newState, playerId);
  }

  if (action.type === 'add_garden') {
    const house = state.houses.find(h => h.number === action.houseNumber);
    if (!house) throw new Error('House not found');
    if (house.hasGarden) throw new Error('House already has a garden');

    let newState: GameState = {
      ...state,
      houses: state.houses.map(h =>
        h.number === action.houseNumber
          ? { ...h, hasGarden: true, gardenPosition: action.gardenPosition, maxDemand: MAX_DEMAND_GARDEN }
          : h
      ),
    };
    newState = addLog(newState, `${player.name} added a garden to house #${action.houseNumber}.`, playerId);
    return advanceWorkingPlayer(newState, playerId);
  }

  throw new Error(`Invalid action for houses sub-phase: ${action.type}`);
}

// ---- Restaurants Sub-Phase ----

function processRestaurants(state: GameState, playerId: string, action: GameAction): GameState {
  if (action.type === 'skip_restaurants') {
    return advanceWorkingPlayer(state, playerId);
  }

  const player = state.players.find(p => p.id === playerId)!;

  if (action.type === 'place_restaurant') {
    if (player.restaurants.length >= MAX_RESTAURANTS_PER_PLAYER) {
      throw new Error('Maximum restaurants reached');
    }

    const restaurant: RestaurantState = {
      id: generateId(),
      position: action.position,
      entranceCorner: action.entranceCorner,
      state: 'coming_soon',
      hasDriveIn: false,
    };

    let newState = updatePlayer(state, playerId, {
      restaurants: [...player.restaurants, restaurant],
    });
    newState = addLog(newState, `${player.name} placed a new restaurant.`, playerId);
    return advanceWorkingPlayer(newState, playerId);
  }

  if (action.type === 'move_restaurant') {
    const restaurant = player.restaurants.find(r => r.id === action.restaurantId);
    if (!restaurant) throw new Error('Restaurant not found');

    const updatedRestaurants = player.restaurants.map(r =>
      r.id === action.restaurantId
        ? { ...r, position: action.newPosition, entranceCorner: action.newEntranceCorner }
        : r
    );

    let newState = updatePlayer(state, playerId, { restaurants: updatedRestaurants });
    newState = addLog(newState, `${player.name} moved a restaurant.`, playerId);
    return advanceWorkingPlayer(newState, playerId);
  }

  throw new Error(`Invalid action for restaurants sub-phase: ${action.type}`);
}

// ---- Sub-Phase Advancement ----

function advanceWorkingPlayer(state: GameState, playerId: string): GameState {
  const nextIdx = getNextPlayerIndex(state);
  if (nextIdx !== null) {
    return { ...state, activePlayerIndex: nextIdx };
  }
  // All players done with this sub-phase
  return advanceSubPhase(state);
}

export function advanceSubPhase(state: GameState): GameState {
  const currentIdx = SUB_PHASE_ORDER.indexOf(state.workingSubPhase!);
  if (currentIdx < SUB_PHASE_ORDER.length - 1) {
    const nextSubPhase = SUB_PHASE_ORDER[currentIdx + 1];
    const firstIdx = getFirstPlayerIndex(state);
    let newState: GameState = {
      ...state,
      workingSubPhase: nextSubPhase,
      activePlayerIndex: firstIdx,
      players: state.players.map(p => ({ ...p, isReady: false })),
    };
    return addLog(newState, `Sub-phase: ${nextSubPhase.replace(/_/g, ' ')}.`);
  }

  // All sub-phases done, advance to dinnertime
  return advanceToDinnertime(state);
}

function advanceToDinnertime(state: GameState): GameState {
  let newState: GameState = {
    ...state,
    phase: 'dinnertime',
    workingSubPhase: undefined,
    players: state.players.map(p => ({ ...p, isReady: false })),
  };
  return addLog(newState, 'Dinnertime phase begins.');
}

// ---- Milestone Helper ----

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
