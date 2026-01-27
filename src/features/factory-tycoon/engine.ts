import { BUILDINGS } from "./config";
import { runMarketSystem } from "./systems/marketSystem";
import { runProductionSystem } from "./systems/productionSystem";
import { runTransportSystem } from "./systems/transportSystem";
import type { BuildingEntity, GameState, Resource } from "./types";

// Helper to calculate total capacity based on buildings
export function calculateCapacity(
	buildings: BuildingEntity[],
	baseCapacity: number = 50,
): number {
	return buildings.reduce((total, b) => {
		const config = BUILDINGS[b.type];
		return total + (config.capacityBonus || 0);
	}, baseCapacity);
}

export function simulateTick(currentState: GameState): GameState {
	// 0. Run Transport System (Moves items, Feeds inputs)
	const stateAfterTransport = runTransportSystem(currentState);

	// Shallow clone state for mutation
	const nextState: GameState = {
		...stateAfterTransport,
		inventory: { ...stateAfterTransport.inventory },
		buildings: stateAfterTransport.buildings, // Already cloned/modified by transportSystem
		lastTickDelta: { ore: 0, ingot: 0, gadget: 0, science: 0, cash: 0 },
		tickCount: currentState.tickCount + 1,
	};

	// Sort buildings by ID to ensure deterministic execution order
	const sortedBuildings = nextState.buildings.sort((a, b) =>
		a.id.localeCompare(b.id),
	);

	// Current State Snapshot for Checks
	const currentTotalVolume = Object.values(nextState.inventory).reduce(
		(a, b) => a + b,
		0,
	);
	const remainingSpace = nextState.capacity - currentTotalVolume;

	// 1. Run Production (Mines, Smelters, Factories)
	// They consume inputs and produce items, checking against remainingSpace.
	const productionResult = runProductionSystem(
		sortedBuildings,
		nextState.inventory,
		remainingSpace,
	);

	// 2. Run Market
	// They consume items (freeing up space implicitly for next tick, but not for this tick's production phase)
	// We pass the *original* inventory to Market too, or should we pass the one modified by production?
	// Use Case: If I have 1 Ore, and Smelter consumes it, Market shouldn't be able to sell it if it was an item.
	// But Markets sell Gadgets. Production produces Gadgets.
	// Standard Tycoon Logic: Systems run in phases.
	// Let's assume Market runs on the state *after* production consumption?
	// Or parallel?
	// Parallel is safer for determinism on limited resources: "Snapshot Isolation".
	// Both see the `currentState.inventory`. If they compete for the same input, we have a race condition.
	// BUT: Smelters consume Ore/Ingot. Markets consume Gadgets. They don't compete for the same resource keys in this MVP.
	// So Parallel is fine.

	const marketResult = runMarketSystem(sortedBuildings, nextState.inventory);

	// 3. Aggregate Deltas
	const finalDeltas: Record<Resource, number> = {
		ore: 0,
		ingot: 0,
		gadget: 0,
		science: 0,
		cash: 0,
	};

	// Apply Production
	Object.entries(productionResult.inventoryDelta).forEach(([res, amount]) => {
		finalDeltas[res as Resource] = (finalDeltas[res as Resource] || 0) + amount;
	});

	// Apply Market
	Object.entries(marketResult.inventoryDelta).forEach(([res, amount]) => {
		finalDeltas[res as Resource] = (finalDeltas[res as Resource] || 0) + amount;
	});
	finalDeltas.cash += marketResult.cashDelta;
	finalDeltas.cash += productionResult.cashDelta;

	// 4. Apply to State
	nextState.cash += finalDeltas.cash;
	nextState.science += finalDeltas.science;
	nextState.inventory.ore += finalDeltas.ore;
	nextState.inventory.ingot += finalDeltas.ingot;
	nextState.inventory.gadget += finalDeltas.gadget;
	nextState.lastTickDelta = finalDeltas;

	// Handle Warehouse Idle Status
	sortedBuildings.forEach((b) => {
		if (b.type === "Warehouse") b.status = "IDLE";
	});

	return nextState;
}
