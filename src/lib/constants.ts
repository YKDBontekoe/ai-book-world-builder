import type { ProjectFolder } from "@/lib/db/schema";
import { generateDummyPassword } from "@/lib/db/utils";

export const isProductionEnvironment = process.env.NODE_ENV === "production";
export const isDevelopmentEnvironment = process.env.NODE_ENV === "development";
export const isTestEnvironment = Boolean(
	process.env.PLAYWRIGHT_TEST_BASE_URL ||
		process.env.PLAYWRIGHT ||
		process.env.CI_PLAYWRIGHT,
);

export const guestRegex = /^guest-\d+$/;

export const DUMMY_PASSWORD = generateDummyPassword();

export const DEFAULT_PROJECT_FOLDERS: ProjectFolder[] = [
	{
		id: "world",
		name: "World",
		slug: "world",
		description:
			"Define lore, rules, and settings that guide the rest of the project.",
	},
	{
		id: "characters",
		name: "Characters",
		slug: "characters",
		description:
			"Track heroes, villains, and supporting casts with their motivations.",
	},
	{
		id: "locations",
		name: "Locations",
		slug: "locations",
		description:
			"Map out key places and how they relate to events or characters.",
	},
	{
		id: "drafts",
		name: "Drafts",
		slug: "drafts",
		description: "Collect works in progress, alternates, and revisions.",
	},
];
