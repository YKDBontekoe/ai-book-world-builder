import { generateBookPlan, createBookFromPlan, planChapterScenes, generateSceneText } from '@/app/actions/story-generation';
import { generateObject, generateText } from 'ai';
import { db } from '@/lib/db/drizzle';
import { ensureProjectAccess } from '@/lib/actions-utils';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mocks
vi.mock('ai', () => ({
  generateObject: vi.fn(),
  generateText: vi.fn(() => Promise.resolve({ text: "Generated content" })),
}));

// Mock DB chain helper
const mockDbChain = () => {
    const chain = {
        values: vi.fn(() => chain),
        returning: vi.fn(() => Promise.resolve([{ id: 'mock-id', sequence: 1 }])),
        from: vi.fn(() => chain),
        where: vi.fn(() => chain),
        orderBy: vi.fn(() => chain), // Return chain for chaining
        limit: vi.fn(() => Promise.resolve([{ id: 'mock-id', title: 'Test', notes: 'Notes', projectId: 'p-1', content: 'prev', sequence: 1 }])),
        set: vi.fn(() => chain),
    };
    return chain;
};

const chainInstance = mockDbChain();

// Override orderBy for the scenes.filter case where it needs to return an array promise directly
// IF it's not chained with limit.
// Actually, `generateSceneText` calls `orderBy(asc(scene.sequence))` and expects a promise that resolves to an array.
// But `createBookFromPlan` calls `orderBy().limit()`.
// Drizzle supports both. In our mock, if `orderBy` returns the chain, we can't await it to get the array.
// We need a mock that acts as both a promise and an object with methods.

const createMockQuery = (resolveValue: any) => {
    const query: any = Promise.resolve(resolveValue);
    query.values = vi.fn(() => query);
    query.returning = vi.fn(() => Promise.resolve([{ id: 'mock-id', sequence: 1 }]));
    query.from = vi.fn(() => query);
    query.where = vi.fn(() => query);
    query.orderBy = vi.fn(() => query);
    query.limit = vi.fn(() => Promise.resolve([{ id: 'mock-id', title: 'Test', notes: 'Notes', projectId: 'p-1', content: 'prev', sequence: 1 }]));
    query.set = vi.fn(() => query);

    // For the filter case, we need the array.
    // If orderBy is the last call, it should resolve to the array.
    // Let's explicitly mock the implementation of orderBy to return a new query that resolves to an array
    // unless limit is called on it.

    // Simpler approach: Just mock `orderBy` to return a Promise that has a `limit` method attached.
    query.orderBy = vi.fn(() => {
        const orderedQuery: any = Promise.resolve([
            { id: 's-1', title: 'S1', content: 'c', sequence: 1, chapterId: 'c-1' },
            { id: 's-2', title: 'S2', content: 'c', sequence: 2, chapterId: 'c-1' }
        ]);
        orderedQuery.limit = vi.fn(() => Promise.resolve([{ id: 'mock-id', title: 'Test', notes: 'Notes', projectId: 'p-1', content: 'prev', sequence: 1 }]));
        return orderedQuery;
    });

    return query;
};

const mockQuery = createMockQuery([]);

vi.mock('@/lib/db/drizzle', () => ({
  db: {
    transaction: vi.fn(async (cb) => {
        return await cb({
            insert: vi.fn(() => mockQuery),
            select: vi.fn(() => mockQuery),
            update: vi.fn(() => mockQuery),
        });
    }),
    insert: vi.fn(() => mockQuery),
    select: vi.fn(() => mockQuery),
    update: vi.fn(() => mockQuery)
  },
}));

vi.mock('@/lib/db/queries/scene', () => ({
  createScene: vi.fn(() => Promise.resolve({ id: 'scene-1' })),
}));

vi.mock('@/lib/actions-utils', () => ({
  ensureProjectAccess: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: () => ({ value: 'gpt-4o' }),
  }),
}));

vi.mock('@/lib/ai/providers', () => ({
    myProvider: {
        languageModel: vi.fn()
    }
}));

vi.mock('@/lib/ai/writer', () => ({
    continueWriting: vi.fn(() => Promise.resolve({ text: "Generated scene content" })),
}));

// Test Suite
describe('Story Generation Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateBookPlan', () => {
    it('should generate a book plan object', async () => {
      const mockPlan = {
        title: 'Mock Title',
        logline: 'Mock Logline',
        summary: 'Mock Summary',
        chapters: [{ title: 'Ch 1', summary: 'Sum 1' }],
      };

      (generateObject as any).mockResolvedValue({ object: mockPlan });

      const result = await generateBookPlan('A test prompt');

      expect(result.success).toBe(true);
      expect(result.plan).toEqual(mockPlan);
    });
  });

  describe('createBookFromPlan', () => {
    it('should use transaction to create entities', async () => {
      const projectId = 'proj-123';
      const plan = {
        title: 'New Book',
        logline: 'Logline',
        summary: 'Summary',
        chapters: [{ title: 'Chapter 1', summary: 'Intro' }],
      };

      const result = await createBookFromPlan(projectId, plan);

      expect(ensureProjectAccess).toHaveBeenCalledWith(projectId, true);
      expect(db.transaction).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('planChapterScenes', () => {
      it('should return scene IDs', async () => {
          (generateObject as any).mockResolvedValue({ object: { scenes: [{ title: 'Scene 1', beat: 'beat' }] } });
          const result = await planChapterScenes('ch-1');
          expect(result.success).toBe(true);
          expect(result.sceneIds).toHaveLength(1);
          expect(result.sceneIds?.[0]).toBe('scene-1');
      });
  });

  describe('generateSceneText', () => {
      it('should update scene content', async () => {
          const result = await generateSceneText('scene-1');
          expect(result.success).toBe(true);
          expect(db.update).toHaveBeenCalled();
      });
  });
});
