import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
	db: {
		select: vi.fn(),
	},
	cache: {
		invalidateCachePattern: vi.fn(),
		getCached: vi.fn(),
		invalidateCache: vi.fn(),
	},
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
	db: mocks.db,
}));

// Mock cache
vi.mock("@/lib/cache", () => ({
	invalidateCachePattern: mocks.cache.invalidateCachePattern,
	getCached: mocks.cache.getCached,
	invalidateCache: mocks.cache.invalidateCache,
}));

describe("GitHub Actions", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.clearAllMocks();

		// Mock console to suppress expected errors
		vi.spyOn(console, "error").mockImplementation(() => {});
		vi.spyOn(console, "warn").mockImplementation(() => {});

		process.env = { ...originalEnv, GITHUB_TOKEN: "mock-token" };
		process.env.GITHUB_OWNER = "TestOwner";
		process.env.GITHUB_REPO = "TestRepo";
		process.env.GITHUB_TOKEN = "test-token";

		// Default to authorized admin
		mocks.auth.mockResolvedValue({
			user: { id: "admin-id", role: "admin" },
		});

		// Default DB mock (return empty array for preferences)
		mocks.db.select.mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue([]),
			}),
		});

		// Default cache mock
		mocks.cache.invalidateCachePattern.mockResolvedValue(undefined);
		mocks.cache.invalidateCache.mockResolvedValue(undefined);
		mocks.cache.getCached.mockImplementation(async (_key, fn) => {
			return await fn();
		});
	});

	afterEach(() => {
		process.env = originalEnv;
		vi.restoreAllMocks();
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
