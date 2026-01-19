import type { BookPlan } from "@/lib/services/schemas/story-schemas";

export interface ProjectTemplate {
	id: string;
	name: string;
	description: string;
	plan: BookPlan;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
	{
		id: "blank",
		name: "Blank Project",
		description: "Start from scratch with an empty project.",
		plan: {
			title: "New Book",
			logline: "",
			summary: "",
			chapters: [],
		},
	},
	{
		id: "heros-journey",
		name: "The Hero's Journey",
		description:
			"The classic monomyth structure described by Joseph Campbell. Perfect for epic adventures and myths.",
		plan: {
			title: "The Hero's Journey",
			logline:
				"A hero ventures forth from the world of common day into a region of supernatural wonder.",
			summary:
				"The Hero's Journey is a common template of a broad category of tales that involve a hero who goes on an adventure, and in a decisive crisis wins a victory, and then comes home changed or transformed.",
			chapters: [
				{
					title: "The Ordinary World",
					summary:
						"Introduce the hero in their normal life before the adventure begins.",
				},
				{
					title: "The Call to Adventure",
					summary:
						"Something shakes up the situation, either from external pressures or from something rising from deep within.",
				},
				{
					title: "Refusal of the Call",
					summary:
						"The hero feels the fear of the unknown and tries to turn away from the adventure, however briefly.",
				},
				{
					title: "Meeting the Mentor",
					summary:
						"The hero comes across a seasoned traveler of the worlds who gives him or her training, equipment, or advice that will help on the journey.",
				},
				{
					title: "Crossing the Threshold",
					summary:
						"At the end of Act One, the hero commits to leaving the Ordinary World and entering a new region or condition with unfamiliar rules and values.",
				},
				{
					title: "Tests, Allies, and Enemies",
					summary:
						"The hero is tested and sorts out allegiances in the Special World.",
				},
				{
					title: "Approach to the Inmost Cave",
					summary:
						"The hero and newfound allies prepare for the major challenge in the Special World.",
				},
				{
					title: "The Ordeal",
					summary:
						"Near the middle of the story, the hero enters a central space in the Special World and confronts death or their greatest fear.",
				},
				{
					title: "Reward (Seizing the Sword)",
					summary:
						"The hero takes possession of the treasure won by facing death. There may be celebration, but there is also danger of losing the treasure again.",
				},
				{
					title: "The Road Back",
					summary:
						"About three-fourths of the way through the story, the hero is driven to complete the adventure, leaving the Special World to be sure the treasure is brought home.",
				},
				{
					title: "The Resurrection",
					summary:
						"At the climax, the hero is severely tested once more on the threshold of home. He or she is purified by a last sacrifice, another moment of death and rebirth.",
				},
				{
					title: "Return with the Elixir",
					summary:
						"The hero returns home or continues the journey, bearing some element of the treasure that has the power to transform the world as the hero has been transformed.",
				},
			],
		},
	},
	{
		id: "three-act",
		name: "Three-Act Structure",
		description:
			"The standard Hollywood structure. Setup, Confrontation, and Resolution.",
		plan: {
			title: "Three-Act Structure",
			logline:
				"A story told in three parts: setup, confrontation, and resolution.",
			summary:
				"The three-act structure is a model used in narrative fiction that divides a story into three parts (acts), often called the Setup, the Confrontation, and the Resolution.",
			chapters: [
				{
					title: "Act I: The Setup",
					summary:
						"Establish the characters, their relationships, and the world they live in. Present the inciting incident.",
				},
				{
					title: "Act I: The Inciting Incident",
					summary:
						"An event thrusts the protagonist into the main action of the story.",
				},
				{
					title: "Act I: Plot Point 1",
					summary: "The protagonist decides to leave their ordinary world.",
				},
				{
					title: "Act II: The Confrontation",
					summary:
						"The protagonist faces obstacles that keep them from achieving their goal.",
				},
				{
					title: "Act II: The Midpoint",
					summary: "A major event that shifts the context of the story.",
				},
				{
					title: "Act II: Plot Point 2",
					summary: "The protagonist is at their lowest point.",
				},
				{
					title: "Act III: The Resolution",
					summary: "The climax and the aftermath.",
				},
				{
					title: "Act III: Climax",
					summary: "The point of highest tension and drama.",
				},
				{
					title: "Act III: Resolution",
					summary: "The loose ends are tied up.",
				},
			],
		},
	},
	{
		id: "save-the-cat",
		name: "Save the Cat!",
		description:
			"Blake Snyder's famous beat sheet for screenwriting and novel writing.",
		plan: {
			title: "Save the Cat!",
			logline: "A structural map ensuring all emotional beats are hit.",
			summary:
				"Based on Blake Snyder's book, this structure ensures pacing and emotional resonance through 15 key beats.",
			chapters: [
				{
					title: "Opening Image",
					summary: "A snapshot of the hero's life before the adventure.",
				},
				{
					title: "Theme Stated",
					summary:
						"What the story is really about, usually spoken to the hero.",
				},
				{
					title: "Set-Up",
					summary: "The hero's status quo and what's missing in their life.",
				},
				{
					title: "Catalyst",
					summary: "The inciting incident that disrupts the status quo.",
				},
				{
					title: "Debate",
					summary: "The hero reacts to the catalyst. Can I do this?",
				},
				{
					title: "Break into Two",
					summary: "The hero makes a choice and the journey begins.",
				},
				{
					title: "B Story",
					summary: "Introduction of a key relationship character.",
				},
				{
					title: "Fun and Games",
					summary:
						"The promise of the premise. The hero explores the new world.",
				},
				{
					title: "Midpoint",
					summary: "False victory or false defeat. The stakes are raised.",
				},
				{
					title: "Bad Guys Close In",
					summary: "Internal and external forces tighten their grip.",
				},
				{
					title: "All Is Lost",
					summary: "The lowest point. The hero loses everything.",
				},
				{
					title: "Dark Night of the Soul",
					summary: "The hero processes the loss and finds the truth.",
				},
				{ title: "Break into Three", summary: "The hero finds the solution." },
				{
					title: "Finale",
					summary: "The hero executes the plan and changes the world.",
				},
				{
					title: "Final Image",
					summary:
						"A mirror to the Opening Image, showing how the hero has changed.",
				},
			],
		},
	},
	{
		id: "snowflake",
		name: "Snowflake Method",
		description:
			"Randy Ingermanson's method of starting small and expanding outward.",
		plan: {
			title: "Snowflake Method",
			logline: "Start with a sentence, expand to a paragraph, then to a page.",
			summary:
				"The Snowflake Method is a structured approach to writing a novel that starts with a simple central idea and systematically expands it into a complex story.",
			chapters: [
				{
					title: "One Sentence Summary",
					summary: "Write a one-sentence summary of your novel.",
				},
				{
					title: "One Paragraph Summary",
					summary:
						"Expand that sentence into a full paragraph describing the story setup, major disasters, and ending.",
				},
				{
					title: "Character Sheets",
					summary: "Create summary sheets for each major character.",
				},
				{
					title: "One Page Synopsis",
					summary: "Expand the one-sentence summary into a full page.",
				},
				{
					title: "Character Synopses",
					summary: "Write a one-page synopsis for each major character.",
				},
				{
					title: "Four Page Synopsis",
					summary: "Expand the one-page synopsis into a four-page synopsis.",
				},
				{
					title: "Character Charts",
					summary: "Create full-fledged character charts detailing everything.",
				},
				{
					title: "Scene List",
					summary:
						"Make a list of all the scenes that you'll need to turn the story into a novel.",
				},
				{
					title: "Scene Description",
					summary: "Write a multi-paragraph description of each scene.",
				},
				{ title: "First Draft", summary: "Write the first draft." },
			],
		},
	},
];
