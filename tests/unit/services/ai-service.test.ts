import { vi, describe, it, expect, beforeEach } from 'vitest';

// -----------------------------------------------------------------------------
// 1. Hoist Mocks
// -----------------------------------------------------------------------------
const mocks = vi.hoisted(() => ({
  ensureProjectAccess: vi.fn(),
  verifyToolAccess: vi.fn(),
  openrouter: vi.fn(),
  generationService: {
    draftScene: vi.fn(),
    generateText: vi.fn(),
    continueWriting: vi.fn(),
  },
  db: {
    query: {
      scene: {
        findFirst: vi.fn(),
      },
      chapter: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn(),
  },
  getScenesForChapter: vi.fn(),
  updateSceneContent: vi.fn(),
  getEntitiesForProject: vi.fn(),
  createEntity: vi.fn(),
  createEntityAttribute: vi.fn(),
}));

// -----------------------------------------------------------------------------
// 2. Mock Modules
// -----------------------------------------------------------------------------

// Mock AI SDK
vi.mock('ai', () => ({
  generateObject: vi.fn(async ({ schema }) => {
     // Return mock data matching the schema
    if (schema.shape.strengths) {
        return { object: { strengths: ['Good'], weaknesses: ['None'], pacing: 'Fast', tone: 'Dark', suggestions: ['None'] } };
    }
    if (schema.shape.issues) {
        return { object: { issues: [], overallCoherence: 10 } };
    }
     if (schema.shape.kind) {
         return { object: { name: 'Test Entity', kind: 'lore', summary: 'A test', attributes: [] } };
     }
     return { object: {} };
  }),
  tool: vi.fn((def) => def),
}));

// Mock Utils
vi.mock('@/lib/actions-utils', () => ({
  ensureProjectAccess: mocks.ensureProjectAccess,
  verifyToolAccess: mocks.verifyToolAccess,
}));

// Mock Providers
vi.mock('@/lib/ai/providers', () => ({
  openrouter: mocks.openrouter,
}));

// Mock Writer Service
vi.mock('@/lib/ai/writer-service', () => ({
  generationService: mocks.generationService,
}));

// Mock DB
vi.mock('@/lib/db/queries', () => ({
  db: mocks.db,
  getScenesForChapter: mocks.getScenesForChapter,
  updateSceneContent: mocks.updateSceneContent,
  getEntitiesForProject: mocks.getEntitiesForProject,
  createEntity: mocks.createEntity,
  createEntityAttribute: mocks.createEntityAttribute,
}));

// -----------------------------------------------------------------------------
// 3. Import System Under Test
// -----------------------------------------------------------------------------
import { aiService } from '@/lib/services/ai-service';

// -----------------------------------------------------------------------------
// 4. Tests
// -----------------------------------------------------------------------------
describe('AIService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('batchWriteChapter', () => {
    it('should iterate scenes and draft content', async () => {
      // Setup
      mocks.getScenesForChapter.mockResolvedValue([
        { id: 's1', title: 'Scene 1', sequence: 1, content: '', projectId: 'p1' },
        // Create a long content string to trigger the >500 char skip
        { id: 's2', title: 'Scene 2', sequence: 2, content: 'a'.repeat(501), projectId: 'p1' },
      ]);
      mocks.generationService.draftScene.mockResolvedValue({ text: 'Drafted content' });

      // Execute
      const result = await aiService.batchWriteChapter('ch1');

      // Verify
      expect(result.success).toBe(true);
      expect(mocks.ensureProjectAccess).toHaveBeenCalledWith('p1', true);
      expect(mocks.generationService.draftScene).toHaveBeenCalledTimes(1); // Only for s1
      expect(mocks.updateSceneContent).toHaveBeenCalledWith({
          sceneId: 's1',
          content: 'Drafted content',
          status: 'drafted'
      });
    });
  });

  describe('rewriteScene', () => {
    it('should generate rewrite text', async () => {
        // Setup
        mocks.db.query.scene.findFirst.mockResolvedValue({ id: 's1', title: 'Scene 1', content: 'Old', projectId: 'p1' });
        mocks.generationService.continueWriting.mockResolvedValue({ text: 'New content' });

        // Execute
        const result = await aiService.rewriteScene('s1', 'Make it better');

        // Verify
        expect(result.text).toBe('New content');
        expect(mocks.ensureProjectAccess).toHaveBeenCalledWith('p1', true);
    });
  });

    describe('expandScene', () => {
    it('should expand notes', async () => {
        // Setup
        mocks.db.query.scene.findFirst.mockResolvedValue({ id: 's1', title: 'Scene 1', content: 'Notes', projectId: 'p1' });
        mocks.generationService.continueWriting.mockResolvedValue({ text: 'Expanded content' });

        // Execute
        const result = await aiService.expandScene('s1', 'Some notes');

        // Verify
        expect(result.text).toBe('Expanded content');
    });
  });
});
