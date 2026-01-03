import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as githubActions from '@/app/actions/github';
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";

// Mock Octokit instance methods
const mockOctokit = {
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
};

// Mock Octokit constructor as a class
vi.mock('octokit', () => {
  return {
    Octokit: class {
      constructor() {
        return mockOctokit;
      }
    },
  };
});

// Mock auth
vi.mock('@/app/(auth)/auth', () => ({
  auth: vi.fn(),
}));

import { auth } from '@/app/(auth)/auth';

describe('GitHub Actions', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, GITHUB_TOKEN: 'mock-token' };
    process.env.GITHUB_OWNER = 'TestOwner';
    process.env.GITHUB_REPO = 'TestRepo';

    // Default to authorized admin
    (auth as any).mockResolvedValue({
      user: { role: 'admin' }
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Authorization', () => {
    it('should fail if user is not logged in', async () => {
      (auth as any).mockResolvedValue({ user: null });

      const result = await githubActions.getRepoStats();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("You must be logged in to perform this action");
      }
    });

    it('should fail if user is not admin', async () => {
      (auth as any).mockResolvedValue({ user: { role: 'user' } });

      const result = await githubActions.getRepoStats();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("You do not have permission to perform this action");
      }
    });
  });

  describe('getRepoStats', () => {
    it('should fetch repo stats successfully using env vars', async () => {
      mockOctokit.rest.repos.get.mockResolvedValue({
        data: {
          stargazers_count: 100,
          forks_count: 20,
          open_issues_count: 5,
        },
      });

      const result = await githubActions.getRepoStats();

      expect(mockOctokit.rest.repos.get).toHaveBeenCalledWith({
        owner: 'TestOwner',
        repo: 'TestRepo',
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

    it('should handle errors gracefully', async () => {
      mockOctokit.rest.repos.get.mockRejectedValue(new Error('API Error'));

      const result = await githubActions.getRepoStats();

      expect(result.success).toBe(false);
    });
  });

  describe('getIssues', () => {
    it('should fetch issues and filter out PRs', async () => {
      mockOctokit.rest.issues.listForRepo.mockResolvedValue({
        data: [
          { number: 1, title: 'Issue 1', pull_request: undefined }, // Issue
          { number: 2, title: 'PR 1', pull_request: {} }, // PR
        ],
      });

      const result = await githubActions.getIssues();

      expect(mockOctokit.rest.issues.listForRepo).toHaveBeenCalledWith(
        expect.objectContaining({
            owner: 'TestOwner',
            repo: 'TestRepo',
        })
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].number).toBe(1);
      }
    });
  });

  describe('getPullRequests', () => {
    it('should fetch pull requests', async () => {
      mockOctokit.rest.pulls.list.mockResolvedValue({
        data: [
          { number: 2, title: 'PR 1' },
        ],
      });

      const result = await githubActions.getPullRequests();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].number).toBe(2);
      }
    });
  });

  describe('postComment', () => {
    it('should post a comment successfully', async () => {
      mockOctokit.rest.issues.createComment.mockResolvedValue({
        data: { id: 123, body: 'Test comment' },
      });

      const result = await githubActions.postComment(1, 'Test comment');

      expect(result.success).toBe(true);
      if (result.success) {
          expect(result.data.body).toBe('Test comment');
      }
      expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith(
        expect.objectContaining({
          owner: 'TestOwner',
          repo: 'TestRepo',
          issue_number: 1,
          body: 'Test comment',
        })
      );
    });
  });
});
