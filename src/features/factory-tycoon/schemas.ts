import { z } from "zod";

export const resourceSchema = z.enum([
	"ore",
	"ingot",
	"gadget",
	"science",
	"cash",
]);

export const buildingStatusSchema = z.enum([
	"RUNNING",
	"STARVED",
	"BLOCKED",
	"IDLE",
]);

export const buildingTypeSchema = z.enum([
	"Mine",
	"Smelter",
	"Factory",
	"Warehouse",
	"Market",
	"TradingPost",
	"Lab",
	"Belt",
	"Splitter",
	"Inserter",
]);

export const directionSchema = z.enum(["N", "E", "S", "W"]);

export const beltItemSchema = z.object({
	id: z.string(),
	resource: resourceSchema,
	position: z.number(),
});

export const buildingEntitySchema = z.object({
	id: z.string(),
	type: buildingTypeSchema,
	x: z.number(),
	y: z.number(),
	status: buildingStatusSchema,
	direction: directionSchema,
	beltItems: z.array(beltItemSchema).optional(),
	holdingItem: beltItemSchema.optional(),
	localInventory: z.record(resourceSchema, z.number()).optional(),
});

export const gameStateSchema = z.object({
	cash: z.number(),
	science: z.number(),
	inventory: z.object({
		ore: z.number(),
		ingot: z.number(),
		gadget: z.number(),
	}),
	capacity: z.number(),
	buildings: z.array(buildingEntitySchema),
	tickCount: z.number(),
	lastTickDelta: z.record(resourceSchema, z.number()).optional(),
	unlockedBuildings: z.array(buildingTypeSchema),
	researchedTechs: z.array(z.string()),
});
