import {
  GameState,
  Campaign,
  ItemType,
  HouseState,
  AbsolutePosition,
} from '../types';
import { MAX_DEMAND_NORMAL, MAX_DEMAND_GARDEN } from '../constants';
import { addLog, manhattanDistance, hasMilestone } from '../utils';

/** Process marketing phase - fully automatic */
export function processMarketing(state: GameState): GameState {
  let newState = state;

  // Process campaigns in campaign number order
  const sortedCampaigns = [...newState.campaigns].sort((a, b) => a.campaignNumber - b.campaignNumber);

  for (const campaign of sortedCampaigns) {
    newState = processCampaign(newState, campaign);
  }

  // Remove expired campaigns (duration <= 0 and not eternal)
  const remainingCampaigns: Campaign[] = [];
  const returnedSupply = { ...newState.campaignSupply };

  for (const campaign of newState.campaigns) {
    if (campaign.duration <= 0 && !campaign.isEternal) {
      // Return campaign number to supply
      returnedSupply[campaign.type] = [...returnedSupply[campaign.type], campaign.campaignNumber].sort((a, b) => a - b);

      // Free up the marketeer
      newState = {
        ...newState,
        players: newState.players.map(p => ({
          ...p,
          employees: p.employees.map(e =>
            e.busyCampaignId === campaign.id
              ? { ...e, location: 'hand' as const, busyCampaignId: undefined }
              : e
          ),
        })),
      };
    } else {
      remainingCampaigns.push(campaign);
    }
  }

  newState = {
    ...newState,
    campaigns: remainingCampaigns,
    campaignSupply: returnedSupply,
  };

  // Advance to cleanup
  newState = {
    ...newState,
    phase: 'cleanup',
    players: newState.players.map(p => ({ ...p, isReady: false })),
  };
  return addLog(newState, 'Cleanup phase begins.');
}

function processCampaign(state: GameState, campaign: Campaign): GameState {
  let newState = state;

  // Find houses in range and place demand
  const affectedHouses = getHousesInRange(newState, campaign);

  for (const house of affectedHouses) {
    const currentDemand = house.demand.length;
    if (currentDemand >= house.maxDemand) continue;

    // Radio campaign with milestone places 2 demand per house
    const player = newState.players.find(p => p.id === campaign.ownerPlayerId);
    const demandCount = (campaign.type === 'radio' && player && hasMilestone(player, 'first_radio_campaign'))
      ? 2 : 1;

    const newDemand = [...house.demand];
    for (let i = 0; i < demandCount && newDemand.length < house.maxDemand; i++) {
      newDemand.push(campaign.itemType);
    }

    newState = {
      ...newState,
      houses: newState.houses.map(h =>
        h.number === house.number ? { ...h, demand: newDemand } : h
      ),
    };
  }

  // Decrement duration
  if (!campaign.isEternal) {
    newState = {
      ...newState,
      campaigns: newState.campaigns.map(c =>
        c.id === campaign.id ? { ...c, duration: c.duration - 1 } : c
      ),
    };
  }

  return newState;
}

function getHousesInRange(state: GameState, campaign: Campaign): HouseState[] {
  switch (campaign.type) {
    case 'billboard':
      // Adjacent: houses within 1 tile (5 squares) distance
      return state.houses.filter(h =>
        manhattanDistance(campaign.position, h.position) <= 5
      );

    case 'mailbox':
      // Mailbox: houses within road range of the marketeer
      return state.houses.filter(h =>
        manhattanDistance(campaign.position, h.position) <= 10
      );

    case 'airplane':
      // Airplane: houses in a line (size x 1 or 1 x size tiles)
      return getAirplaneHouses(state, campaign);

    case 'radio':
      // Radio: 3x3 tile area (15x15 squares) centered on campaign position
      return state.houses.filter(h => {
        const dr = Math.abs(h.position.row - campaign.position.row);
        const dc = Math.abs(h.position.col - campaign.position.col);
        return dr <= 7 && dc <= 7; // ~3x3 tiles
      });

    default:
      return [];
  }
}

function getAirplaneHouses(state: GameState, campaign: Campaign): HouseState[] {
  const size = campaign.airplaneSize || 1;
  const orientation = campaign.airplaneOrientation || 'horizontal';
  const halfSize = Math.floor(size * 5 / 2);

  return state.houses.filter(h => {
    if (orientation === 'horizontal') {
      const dc = Math.abs(h.position.col - campaign.position.col);
      const dr = Math.abs(h.position.row - campaign.position.row);
      return dc <= halfSize && dr <= 2;
    } else {
      const dr = Math.abs(h.position.row - campaign.position.row);
      const dc = Math.abs(h.position.col - campaign.position.col);
      return dr <= halfSize && dc <= 2;
    }
  });
}
