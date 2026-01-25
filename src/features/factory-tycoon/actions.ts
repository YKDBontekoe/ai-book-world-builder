'use server';

import { createUserAction } from '@/lib/action-middleware';
import { db } from '@/lib/db';
import { factoryTycoonSaves } from '@/lib/db/schema/factory-tycoon';
import { eq } from 'drizzle-orm';
import { INITIAL_STATE } from './config';
import { gameStateSchema } from './schemas';
import { GameState } from './types';

/**
 * Save the game state to the database.
 *
 * Validates the state against the schema to prevent integrity violations.
 */
export const saveGameState = createUserAction({
  input: gameStateSchema,
  handler: async ({ user, input }) => {
    const userId = user.id;

    // Check if save exists
    const existingSave = await db.query.factoryTycoonSaves.findFirst({
      where: eq(factoryTycoonSaves.userId, userId),
    });

    if (existingSave) {
      await db
        .update(factoryTycoonSaves)
        .set({
          state: input,
          updatedAt: new Date(),
        })
        .where(eq(factoryTycoonSaves.id, existingSave.id));
    } else {
      await db.insert(factoryTycoonSaves).values({
        userId,
        state: input,
      });
    }

    return { success: true };
  },
});

/**
 * Load the game state from the database.
 */
export const loadGameState = createUserAction({
  handler: async ({ user }) => {
    const userId = user.id;

    const save = await db.query.factoryTycoonSaves.findFirst({
      where: eq(factoryTycoonSaves.userId, userId),
    });

    if (!save) return null;

    const loadedState = save.state as unknown as Partial<GameState>;

    // Merge with default state to ensure all fields exist (handling schema updates)
    // We deep merge inventory to ensure new resources are initialized
    const finalState: GameState = {
      ...INITIAL_STATE,
      ...loadedState,
      inventory: {
        ...INITIAL_STATE.inventory,
        ...(loadedState.inventory || {}),
      },
      // Ensure critical arrays exist if they were missing in old saves
      unlockedBuildings: Array.from(new Set([
          ...(loadedState.unlockedBuildings ?? INITIAL_STATE.unlockedBuildings),
          'Belt',
          'Splitter',
          'Inserter'
      ])) as any,
      researchedTechs: loadedState.researchedTechs ?? INITIAL_STATE.researchedTechs,
    };

    return finalState;
  },
});
