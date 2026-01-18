import { generateObject } from "ai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { auth } from "@/app/(auth)/auth";
import { POST } from "@/app/api/ai-suggestions/route";
import {
	getChaptersForProject,
	getEntitiesForProject,
	getOutlineForProject,
	getProjectByIdWithAccess,
} from "@/lib/db/queries";

// Mock dependencies
vi.mock("ai", () => ({
	generateObject: vi.fn().mockResolvedValue({ object: { suggestions: [] } }),
}));

vi.mock("@/app/(auth)/auth", () => ({
	auth: vi.fn(),
}));

vi.mock("@/lib/db/queries", () => ({
	getProjectByIdWithAccess: vi.fn(),
	getEntitiesForProject: vi.fn(),
	getOutlineForProject: vi.fn(),
	getChaptersForProject: vi.fn(),
}));

vi.mock("@/lib/ai/providers", () => ({
	myProvider: {
		languageModel: vi.fn().mockReturnValue("mock-model"),
	},
}));

vi.mock("@/lib/ai/models", () => ({
	DEFAULT_MODELS: { light: "light" },
	isChatModelId: vi.fn().mockReturnValue(true),
}));

describe("POST /api/ai-suggestions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should fail if unauthorized", async () => {
		(auth as any).mockResolvedValue(null);
		const request = new Request("http://localhost/api/ai-suggestions", {
			method: "POST",
		});
		const response = await POST(request);
		expect(response.status).toBe(401);
	});

	it("should use system prompt and messages correctly (Security Fix Verification)", async () => {
		(auth as any).mockResolvedValue({ user: { id: "user-1" } });
		(getProjectByIdWithAccess as any).mockResolvedValue({
			id: "proj-1",
			name: "Test Project",
		});
		(getEntitiesForProject as any).mockResolvedValue([]);
		(getOutlineForProject as any).mockResolvedValue(null);
		(getChaptersForProject as any).mockResolvedValue([]);

		const messages = [
			{ role: "user", content: "Hello" },
			{ role: "assistant", content: "Hi" },
			{ role: "user", content: "Suggest something" },
		];

		const request = new Request("http://localhost/api/ai-suggestions", {
			method: "POST",
			body: JSON.stringify({
				projectId: "proj-1",
				messages,
				modelId: "gpt-4",
			}),
		});

		await POST(request);

		// Verify generateObject was called with specific structure
		const generateObjectMock = generateObject as any;
		expect(generateObjectMock).toHaveBeenCalledTimes(1);

		const callArgs = generateObjectMock.mock.calls[0][0];

		// Security Check 1: 'messages' should be passed directly, not concatenated
		expect(callArgs.messages).toEqual(messages);

		// Security Check 2: 'system' property should exist and contain instructions
		expect(callArgs.system).toBeDefined();
		expect(callArgs.system).toContain("You are a creative writing assistant");
		expect(callArgs.system).toContain("Test Project"); // Project context in system

		// Security Check 3: 'prompt' property should NOT exist
		expect(callArgs.prompt).toBeUndefined();
	});
});
