import { BuildingConfig, BuildingType, GameState } from './types';

export const GRID_SIZE = 20;
export const BASE_CAPACITY = 50;
export const LOCAL_INVENTORY_CAPACITY = 50;
export const TICK_RATE_MS = 1000;

export interface Tech {
    id: string;
    name: string;
    cost: number;
    description: string;
    unlocks?: BuildingType[];
}

export const TECHS: Record<string, Tech> = {
  mass_production: {
    id: 'mass_production',
    name: 'Mass Production',
    cost: 10,
    description: 'Unlocks Factory and Market buildings.',
    unlocks: ['Factory', 'Market'],
  }
};

export const RESOURCE_VALUES: Partial<Record<keyof GameState['inventory'], number>> = {
  ore: 1,
  ingot: 3,
  gadget: 8,
};

export const BUILDINGS: Record<BuildingType, BuildingConfig> = {
  Mine: {
    type: 'Mine',
    cost: 10,
    inputs: {},
    outputs: { ore: 1 },
    description: 'Produces Ore (+1/tick)',
  },
  Smelter: {
    type: 'Smelter',
    cost: 25,
    inputs: { ore: 2 },
    outputs: { ingot: 1 },
    description: 'Smelts Ore into Ingots (-2 ore -> +1 ingot)',
  },
  TradingPost: {
    type: 'TradingPost',
    cost: 50,
    inputs: { ingot: 1 },
    outputs: { cash: 2 },
    description: 'Sells Ingots for Cash (-1 ingot -> +$2)',
  },
  Lab: {
    type: 'Lab',
    cost: 100,
    inputs: { ingot: 1 },
    outputs: { science: 1 },
    description: 'Conducts research using Ingots (-1 ingot -> +1 science)',
  },
  Factory: {
    type: 'Factory',
    cost: 60,
    inputs: { ingot: 2 },
    outputs: { gadget: 1 },
    description: 'Assembles Ingots into Gadgets (-2 ingot -> +1 gadget)',
  },
  Warehouse: {
    type: 'Warehouse',
    cost: 40,
    inputs: {},
    outputs: {},
    capacityBonus: 50,
    description: 'Increases storage capacity (+50)',
  },
  Market: {
    type: 'Market',
    cost: 80,
    inputs: { gadget: 1 },
    outputs: { cash: 5 },
    description: 'Sells Gadgets for Cash (-1 gadget -> +$5)',
  },
  Belt: {
    type: 'Belt',
    cost: 5,
    inputs: {},
    outputs: {},
    description: 'Transports resources.',
  },
  Splitter: {
    type: 'Splitter',
    cost: 15,
    inputs: {},
    outputs: {},
    description: 'Splits resources 50/50.',
  },
  Inserter: {
    type: 'Inserter',
    cost: 10,
    inputs: {},
    outputs: {},
    description: 'Moves items from behind to front.',
  },
};

export const INITIAL_STATE: GameState = {
  cash: 20,
  science: 0,
  inventory: {
    ore: 0,
    ingot: 0,
    gadget: 0,
  },
  capacity: BASE_CAPACITY,
  buildings: [],
  tickCount: 0,
  lastTickDelta: {
    ore: 0,
    ingot: 0,
    gadget: 0,
    science: 0,
    cash: 0,
  },
  unlockedBuildings: ['Mine', 'Smelter', 'TradingPost', 'Warehouse', 'Lab', 'Belt', 'Splitter', 'Inserter'],
  researchedTechs: [],
};
