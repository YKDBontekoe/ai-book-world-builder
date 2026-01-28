"use server";

import { eq } from "drizzle-orm";
import { auth } from "@/app/(auth)/auth"; // Using correct auth path
import { db } from "@/lib/db";
import { factoryTycoonSaves } from "@/lib/db/schema/factory-tycoon";
import { INITIAL_STATE } from "./config";
import type { GameState } from "./types";

export async function saveGameState(state: GameState): Promise<void> {
	const session = await auth();
	if (!session?.user?.id) {
		throw new Error("Unauthorized");
	}

	const userId = session.user.id;

	// Check if save exists
	const existingSave = await db.query.factoryTycoonSaves.findFirst({
		where: eq(factoryTycoonSaves.userId, userId),
	});

	if (existingSave) {
		await db
			.update(factoryTycoonSaves)
			.set({
				state: state,
				updatedAt: new Date(),
			})
			.where(eq(factoryTycoonSaves.id, existingSave.id));
	} else {
		await db.insert(factoryTycoonSaves).values({
			userId,
			state: state,
		});
	}
}

export async function loadGameState(): Promise<GameState | null> {
	const session = await auth();
	if (!session?.user?.id) {
		return null;
	}

	const userId = session.user.id;

	const save = await db.query.factoryTycoonSaves.findFirst({
		where: eq(factoryTycoonSaves.userId, userId),
	});

	if (!save) return null;

	const loadedState = save.state;

	// Merge with default state to ensure all fields exist (handling schema updates)
	// We deep merge inventory to ensure new resources are initialized
	return {
		...INITIAL_STATE,
		...loadedState,
		inventory: {
			...INITIAL_STATE.inventory,
			...(loadedState.inventory || {}),
		},
		// Ensure critical arrays exist if they were missing in old saves
		unlockedBuildings: Array.from(
			new Set([
				...(loadedState.unlockedBuildings ?? INITIAL_STATE.unlockedBuildings),
				"Belt",
				"Splitter",
				"Inserter",
			]),
		) as GameState["unlockedBuildings"],
		researchedTechs:
			loadedState.researchedTechs ?? INITIAL_STATE.researchedTechs,
	};
}
