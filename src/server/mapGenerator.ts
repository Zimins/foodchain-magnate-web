import fs from 'fs';
import path from 'path';
import type { MapTile, MapSquare, HouseState } from '../game/types';
import { SETUP_BY_PLAYER_COUNT, MAX_DEMAND_NORMAL } from '../game/constants';

interface TileTemplate {
  id: string;
  name: string;
  grid: MapSquare[][];
}

const TILES_DIR = path.join(process.cwd(), 'data/tiles');

/** Read all tile templates from data/tiles/ */
function loadTileTemplates(): TileTemplate[] {
  try {
    if (!fs.existsSync(TILES_DIR)) return [];
    const files = fs.readdirSync(TILES_DIR).filter((f) => f.endsWith('.json'));
    return files.map((f) => {
      const raw = fs.readFileSync(path.join(TILES_DIR, f), 'utf-8');
      return JSON.parse(raw) as TileTemplate;
    });
  } catch {
    return [];
  }
}

/** Rotate a grid 90° clockwise once */
function rotateGrid90(grid: MapSquare[][]): MapSquare[][] {
  const rotated: MapSquare[][] = Array.from({ length: 5 }, () => Array(5));
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const sq = grid[r][c];
      // Rotate directional properties
      let rotatedSq = sq;
      if (sq.type === 'bridge' && sq.bridgeDirection) {
        rotatedSq = { ...sq, bridgeDirection: sq.bridgeDirection === 'horizontal' ? 'vertical' : 'horizontal' };
      } else if (sq.type === 'cul_de_sac' && sq.openDirection) {
        const cwMap: Record<string, 'north' | 'south' | 'east' | 'west'> = {
          north: 'east', east: 'south', south: 'west', west: 'north',
        };
        rotatedSq = { ...sq, openDirection: cwMap[sq.openDirection] };
      }
      rotated[c][4 - r] = rotatedSq;
    }
  }
  return rotated;
}

/** Apply N*90° rotation */
function rotateGrid(grid: MapSquare[][], rotation: 0 | 90 | 180 | 270): MapSquare[][] {
  let result = grid;
  const times = rotation / 90;
  for (let t = 0; t < times; t++) {
    result = rotateGrid90(result);
  }
  return result;
}

/** Fisher-Yates shuffle (in-place) */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Random rotation value */
function randomRotation(): 0 | 90 | 180 | 270 {
  const rotations: (0 | 90 | 180 | 270)[] = [0, 90, 180, 270];
  return rotations[Math.floor(Math.random() * 4)];
}

/**
 * Generate a map using saved tile templates.
 * Shuffles templates without duplicates, applies random rotations.
 * Falls back to null if not enough templates are available.
 */
export function generateMapFromTemplates(
  playerCount: number,
): { tiles: MapTile[][]; houses: HouseState[] } | null {
  const setup = SETUP_BY_PLAYER_COUNT[playerCount];
  const needed = setup.mapRows * setup.mapCols;
  const templates = loadTileTemplates();

  if (templates.length < needed) return null;

  // Shuffle and pick
  const shuffled = shuffle([...templates]);
  const picked = shuffled.slice(0, needed);

  const tiles: MapTile[][] = [];
  const houses: HouseState[] = [];
  let tileId = 1;
  let idx = 0;

  for (let r = 0; r < setup.mapRows; r++) {
    const row: MapTile[] = [];
    for (let c = 0; c < setup.mapCols; c++) {
      const template = picked[idx++];
      const rotation = randomRotation();
      const grid = rotateGrid(template.grid, rotation);

      row.push({ id: tileId, grid, rotation: 0 }); // rotation already baked in

      // Scan for house/apartment squares to build HouseState entries
      const seenNumbers = new Set<number>();
      for (let sr = 0; sr < 5; sr++) {
        for (let sc = 0; sc < 5; sc++) {
          const sq = grid[sr][sc];
          if ((sq.type === 'house' || sq.type === 'apartment') && sq.houseNumber != null) {
            if (!seenNumbers.has(sq.houseNumber)) {
              seenNumbers.add(sq.houseNumber);
              houses.push({
                number: sq.houseNumber,
                position: { row: r * 5 + sr, col: c * 5 + sc },
                hasGarden: false,
                demand: [],
                maxDemand: MAX_DEMAND_NORMAL,
              });
            }
          }
        }
      }

      tileId++;
    }
    tiles.push(row);
  }

  return { tiles, houses };
}
