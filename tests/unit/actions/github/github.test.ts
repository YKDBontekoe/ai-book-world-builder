import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import * as githubActions from "@/app/actions/github";

const mocks = vi.hoisted(() => ({
	octokit: {
		rest: {
			repos: {
				get: vi.fn(),
			},
			issues: {
				listForRepo: vi.fn(),
				get: vi.fn(),
				listComments: vi.fn(),
				createComment: vi.fn(),
				update: vi.fn(),
			},
			pulls: {
				list: vi.fn(),
				get: vi.fn(),
				merge: vi.fn(),
			},
		},
	},
	auth: vi.fn(),
}));

vi.mock("octokit", () => {
	return {
		// biome-ignore lint/complexity/useArrowFunction: Octokit must be constructed with new
		Octokit: vi.fn().mockImplementation(function () {
			return mocks.octokit;
		}),
	};
});

// Mock auth
vi.mock("@/app/(auth)/auth", () => ({
	auth: mocks.auth,
}));

// Mock db
vi.mock("@/lib/db", () => ({
	db: {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi
			.fn()
			.mockResolvedValue([
				{ julesPreferences: { repository: "TestOwner/TestRepo" } },
			]),
	},
}));

// Mock cache
vi.mock("@/lib/cache", () => ({
	invalidateCache: vi.fn(),
	invalidateCachePattern: vi.fn(),
	getCached: vi.fn((_key, fetchFn) => fetchFn()),
}));

describe("GitHub Actions", () => {
	const originalEnv = process.env;
	let consoleErrorSpy: MockInstance<Console["error"]>;

	beforeEach(() => {
		vi.clearAllMocks();
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		process.env = { ...originalEnv, GITHUB_TOKEN: "mock-token" };
		process.env.GITHUB_OWNER = "TestOwner";
		process.env.GITHUB_REPO = "TestRepo";
		process.env.GITHUB_TOKEN = "test-token";

		// Default to authorized admin
		mocks.auth.mockResolvedValue({
			user: { id: "admin-id", role: "admin" },
		});
	});

	afterEach(() => {
		process.env = originalEnv;
		consoleErrorSpy.mockRestore();
	});

	describe("Authorization", () => {
		it("should fail if user is not logged in", async () => {
			mocks.auth.mockResolvedValue({ user: null });

			const result = await githubActions.getRepoStats();

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe(
					"You must be logged in to perform this action",
				);
			}
		});

		it("should fail if user is not admin", async () => {
			mocks.auth.mockResolvedValue({
				user: { id: "user-id", role: "user" },
			});

			const result = await githubActions.getRepoStats();

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe("Admin access required");
			}
		});
	});

	describe("getRepoStats", () => {
		it("should fetch repo stats successfully using env vars", async () => {
			mocks.octokit.rest.repos.get.mockResolvedValue({
				data: {
					stargazers_count: 100,
					forks_count: 20,
					open_issues_count: 5,
				},
			});

			const result = await githubActions.getRepoStats();

			expect(mocks.octokit.rest.repos.get).toHaveBeenCalledWith({
				owner: "TestOwner",
				repo: "TestRepo",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual({
					stars: 100,
					forks: 20,
					openIssues: 5,
				});
			}
		});

		it("should handle errors gracefully", async () => {
			mocks.octokit.rest.repos.get.mockRejectedValue(new Error("API Error"));

			const result = await githubActions.getRepoStats();

			expect(result.success).toBe(false);
		});
	});

	describe("getIssues", () => {
		it("should fetch issues and filter out PRs", async () => {
			mocks.octokit.rest.issues.listForRepo.mockResolvedValue({
				data: [
					{ number: 1, title: "Issue 1", pull_request: undefined }, // Issue
					{ number: 2, title: "PR 1", pull_request: {} }, // PR
				],
			});

			const result = await githubActions.getIssues();

			expect(mocks.octokit.rest.issues.listForRepo).toHaveBeenCalledWith(
				expect.objectContaining({
					owner: "TestOwner",
					repo: "TestRepo",
				}),
			);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toHaveLength(1);
				expect(result.data[0].number).toBe(1);
			}
		});
	});

	describe("getPullRequests", () => {
		it("should fetch pull requests", async () => {
			mocks.octokit.rest.pulls.list.mockResolvedValue({
				data: [{ number: 2, title: "PR 1" }],
			});

			const result = await githubActions.getPullRequests();

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toHaveLength(1);
				expect(result.data[0].number).toBe(2);
			}
		});
	});

	describe("postComment", () => {
		it("should post a comment successfully", async () => {
			mocks.octokit.rest.issues.createComment.mockResolvedValue({
				data: { id: 123, body: "Test comment" },
			});

			const result = await githubActions.postComment({
				number: 1,
				body: "Test comment",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.body).toBe("Test comment");
			}
			expect(mocks.octokit.rest.issues.createComment).toHaveBeenCalledWith(
				expect.objectContaining({
					owner: "TestOwner",
					repo: "TestRepo",
					issue_number: 1,
					body: "Test comment",
				}),
			);
		});
	});
});
