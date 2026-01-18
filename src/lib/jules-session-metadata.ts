import "server-only";

import { nanoid } from "nanoid";
import type { GitHubRepository } from "@/lib/github-types";

const METADATA_PATH = `${process.cwd()}/.data/jules-sessions.json`;

export type JulesAutomationPreference = "manual" | "auto";

export interface JulesSessionMetadata {
	id: string;
	sessionId: string;
	repository: GitHubRepository;
	baseBranch: string;
	automationMode: JulesAutomationPreference;
	createdAt: string;
}

type JulesSessionMetadataStore = {
	items: JulesSessionMetadata[];
};

async function readStore(): Promise<JulesSessionMetadataStore> {
	if (typeof window !== "undefined") {
		return { items: [] };
	}
	const fs = await import("node:fs/promises");
	const path = await import("node:path");

	try {
		const raw = await fs.readFile(METADATA_PATH, "utf-8");
		const parsed = JSON.parse(raw) as JulesSessionMetadataStore;
		if (!parsed.items) {
			return { items: [] };
		}
		return parsed;
	} catch {
		await fs.mkdir(path.dirname(METADATA_PATH), { recursive: true });
		return { items: [] };
	}
}

async function writeStore(store: JulesSessionMetadataStore): Promise<void> {
	if (typeof window !== "undefined") {
		return;
	}
	const fs = await import("node:fs/promises");
	const path = await import("node:path");
	await fs.mkdir(path.dirname(METADATA_PATH), { recursive: true });
	await fs.writeFile(METADATA_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export async function saveJulesSessionMetadata(
	metadata: Omit<JulesSessionMetadata, "id" | "createdAt">,
): Promise<JulesSessionMetadata> {
	const store = await readStore();
	const record: JulesSessionMetadata = {
		id: nanoid(),
		createdAt: new Date().toISOString(),
		...metadata,
	};
	store.items = store.items.filter(
		(item) => item.sessionId !== metadata.sessionId,
	);
	store.items.unshift(record);
	await writeStore(store);
	return record;
}

export async function getJulesSessionMetadata(
	sessionId: string,
): Promise<JulesSessionMetadata | null> {
	const store = await readStore();
	const normalized = sessionId.startsWith("sessions/")
		? sessionId.split("/")[1]
		: sessionId;
	return (
		store.items.find(
			(item) => item.sessionId === sessionId || item.sessionId === normalized,
		) ?? null
	);
}
