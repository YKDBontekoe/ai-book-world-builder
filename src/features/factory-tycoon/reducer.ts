import { nanoid } from 'nanoid';
import { BUILDINGS, RESOURCE_VALUES, TECHS } from './config';
import { calculateCapacity, simulateTick } from './engine';
import { processInteraction } from './systems/interactionSystem';
import { BuildingEntity, BuildingType, Direction, GameState } from './types';

export type Action =
  | { type: 'TICK' }
  | { type: 'ADD_BUILDING'; buildingType: BuildingType; x: number; y: number; direction?: Direction }
  | { type: 'REMOVE_BUILDING'; id: string }
  | { type: 'ROTATE_BUILDING'; id: string }
  | { type: 'SET_STATE'; payload: GameState }
  | { type: 'RESEARCH_TECH'; techId: string }
  | { type: 'SELL_RESOURCE'; resource: keyof GameState['inventory'] }
  | { type: 'MANUAL_INTERACT'; x: number; y: number };

export function getNextDirection(dir: Direction): Direction {
  const dirs: Direction[] = ['N', 'E', 'S', 'W'];
  const idx = dirs.indexOf(dir);
  return dirs[(idx + 1) % 4];
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'TICK':
      return simulateTick(state);
    case 'SELL_RESOURCE': {
      const value = RESOURCE_VALUES[action.resource];
      if (!value) return state;
      if (state.inventory[action.resource] < 1) return state;

      return {
        ...state,
        cash: state.cash + value,
        inventory: {
          ...state.inventory,
          [action.resource]: state.inventory[action.resource] - 1,
        },
      };
    }
    case 'ADD_BUILDING': {
      const config = BUILDINGS[action.buildingType];
      if (state.cash < config.cost) return state;

      if (state.buildings.some(b => b.x === action.x && b.y === action.y)) return state;

      const newBuilding: BuildingEntity = {
        id: nanoid(),
        type: action.buildingType,
        x: action.x,
        y: action.y,
        status: 'IDLE',
        direction: action.direction || 'N',
      };

      // Sort by ID to ensure deterministic execution order without sorting every tick
      const newBuildings = [...state.buildings, newBuilding].sort((a, b) => a.id.localeCompare(b.id));

      return {
        ...state,
        cash: state.cash - config.cost,
        buildings: newBuildings,
        capacity: calculateCapacity(newBuildings),
      };
    }
    case 'REMOVE_BUILDING': {
      const newBuildings = state.buildings.filter(b => b.id !== action.id);
      return {
        ...state,
        buildings: newBuildings,
        capacity: calculateCapacity(newBuildings),
      };
    }
    case 'ROTATE_BUILDING': {
      const newBuildings = state.buildings.map(b => {
        if (b.id === action.id) {
          return { ...b, direction: getNextDirection(b.direction) };
        }
        return b;
      });
      return {
        ...state,
        buildings: newBuildings,
      };
    }
    case 'RESEARCH_TECH': {
      const tech = Object.values(TECHS).find(t => t.id === action.techId);
      if (!tech) return state;
      if (state.researchedTechs.includes(tech.id)) return state;
      if (state.science < tech.cost) return state;

      const newUnlocked = [...state.unlockedBuildings];
      if (tech.unlocks) {
          tech.unlocks.forEach(b => {
              if (!newUnlocked.includes(b)) newUnlocked.push(b);
          });
      }

      return {
          ...state,
          science: state.science - tech.cost,
          researchedTechs: [...state.researchedTechs, tech.id],
          unlockedBuildings: newUnlocked
      };
    }
    case 'SET_STATE':
        // Ensure buildings are sorted when loading state
        return {
            ...action.payload,
            buildings: [...action.payload.buildings].sort((a, b) => a.id.localeCompare(b.id))
        };
    case 'MANUAL_INTERACT': {
        return processInteraction(state, action.x, action.y);
    }
    default:
      return state;
  }
}
