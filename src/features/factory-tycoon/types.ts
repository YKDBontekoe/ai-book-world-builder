export type Resource = 'ore' | 'ingot' | 'gadget' | 'science' | 'cash';

export type BuildingStatus = 'RUNNING' | 'STARVED' | 'BLOCKED' | 'IDLE';

export type BuildingType = 'Mine' | 'Smelter' | 'Factory' | 'Warehouse' | 'Market' | 'TradingPost' | 'Lab' | 'Belt' | 'Splitter' | 'Inserter';

export type Direction = 'N' | 'E' | 'S' | 'W';

export interface BeltItem {
  id: string;
  resource: Resource;
  position: number; // 0 to 1 progress on the tile
}

export interface BuildingConfig {
  type: BuildingType;
  cost: number;
  inputs: Partial<Record<Resource, number>>;
  outputs: Partial<Record<Resource, number>>;
  capacityBonus?: number;
  description: string;
}

export interface BuildingEntity {
  id: string;
  type: BuildingType;
  x: number;
  y: number;
  status: BuildingStatus;
  direction: Direction;
  beltItems?: BeltItem[];
  holdingItem?: BeltItem; // For Inserters
  localInventory?: Partial<Record<Resource, number>>;
}

export interface GameState {
  cash: number;
  science: number;
  inventory: Record<Exclude<Resource, 'cash' | 'science'>, number>;
  capacity: number;
  buildings: BuildingEntity[];
  tickCount: number;
  lastTickDelta: Partial<Record<Resource, number>>;
  unlockedBuildings: BuildingType[];
  researchedTechs: string[];
}

export type SystemResult = {
  inventoryDelta: Partial<Record<Resource, number>>;
  cashDelta: number;
  consumedCapacity: number; // Volume added/removed
};
