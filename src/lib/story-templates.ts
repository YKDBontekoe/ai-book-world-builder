import { Cpu, Rocket, Search, Sword } from "lucide-react";
import type { StoryStyle } from "@/lib/services/schemas/story-schemas";
import type { ElementType } from "react";

export interface StoryTemplate {
	label: string;
	description: string;
	prompt: string;
	style: StoryStyle;
	icon: ElementType;
}

export const STORY_TEMPLATES: StoryTemplate[] = [
	{
		label: "The Hero's Journey",
		description: "A classic adventure where an unlikely hero saves the world.",
		prompt:
			"A young farm boy discovers he is the heir to a lost kingdom and must defeat a dark lord who threatens to plunge the world into eternal darkness.",
		style: { genre: "Fantasy", pov: "Third Person Limited", tone: "Epic" },
		icon: Sword,
	},
	{
		label: "Cyberpunk Noir",
		description: "High-tech low-life mystery in a dystopian future.",
		prompt:
			"In a neon-soaked metropolis, a washed-up detective takes on a missing person case that uncovers a conspiracy reaching the highest levels of the mega-corporations.",
		style: { genre: "Sci-Fi", pov: "First Person", tone: "Dark" },
		icon: Cpu,
	},
	{
		label: "Whodunit",
		description: "A classic murder mystery with a twist.",
		prompt:
			"When a wealthy tycoon is found dead in his locked study, a brilliant but eccentric detective must interview the eccentric guests to find the killer before they strike again.",
		style: {
			genre: "Mystery",
			pov: "Third Person Omniscient",
			tone: "Intimate",
		},
		icon: Search,
	},
	{
		label: "Space Opera",
		description: "Intergalactic conflict and adventure.",
		prompt:
			"The crew of a scavenger ship discovers an ancient alien artifact that holds the key to saving the galaxy from a robotic invasion.",
		style: { genre: "Sci-Fi", pov: "Third Person Omniscient", tone: "Epic" },
		icon: Rocket,
	},
];
