import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as aiOperations from '@/app/actions/ai-operations';
import { writingService } from '@/lib/services/ai/writing-service';
import { analysisService } from '@/lib/services/ai/analysis-service';
import { loreService } from '@/lib/services/ai/lore-service';
import { manuscriptService } from '@/lib/services/ai/manuscript-service';

// Mock dependencies
vi.mock('@/lib/services/ai/writing-service', () => ({
  writingService: {
    batchWriteChapter: vi.fn(),
    rewriteScene: vi.fn(),
    expandScene: vi.fn(),
  },
}));

vi.mock('@/lib/services/ai/analysis-service', () => ({
  analysisService: {
    critiqueChapter: vi.fn(),
    analyzeConsistency: vi.fn(),
    dialogueCoach: vi.fn(),
  },
}));

vi.mock('@/lib/services/ai/lore-service', () => ({
  loreService: {
    generateLore: vi.fn(),
    searchProject: vi.fn(),
  },
}));

vi.mock('@/lib/services/ai/manuscript-service', () => ({
  manuscriptService: {
    askManuscript: vi.fn(),
  },
}));

describe('AI Operations Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('batchWriteChapterAction', () => {
    it('should return success response on success', async () => {
      vi.mocked(writingService.batchWriteChapter).mockResolvedValue({ success: true, writtenCount: 5 });

      const result = await aiOperations.batchWriteChapterAction('chapter-1', 'instructions');

      expect(result).toEqual({ success: true, writtenCount: 5 });
      expect(writingService.batchWriteChapter).toHaveBeenCalledWith('chapter-1', 'instructions');
    });

    it('should return friendly error message on failure', async () => {
      vi.mocked(writingService.batchWriteChapter).mockRejectedValue(new Error('API Error'));

      const result = await aiOperations.batchWriteChapterAction('chapter-1');

      expect(result).toEqual({
        success: false,
        error: 'Failed to generate scenes. Please try again later.',
      });
      expect(console.error).toHaveBeenCalledWith('[AI Operations] Batch Write Error:', expect.any(Error));
    });
  });

  describe('rewriteSceneAction', () => {
    it('should return result on success', async () => {
      vi.mocked(writingService.rewriteScene).mockResolvedValue({ text: 'rewritten' });

      const result = await aiOperations.rewriteSceneAction('scene-1', 'make it better');

      expect(result).toEqual({ text: 'rewritten' });
    });

    it('should return friendly error on failure', async () => {
      vi.mocked(writingService.rewriteScene).mockRejectedValue(new Error('Fail'));

      const result = await aiOperations.rewriteSceneAction('scene-1', 'prompt');

      expect(result).toEqual({ error: 'Failed to rewrite scene. Please try again.' });
    });
  });

  describe('expandSceneAction', () => {
    it('should return result on success', async () => {
      vi.mocked(writingService.expandScene).mockResolvedValue({ text: 'expanded content' });

      const result = await aiOperations.expandSceneAction('scene-1', 'more details');

      expect(result).toEqual({ text: 'expanded content' });
    });

    it('should return friendly error on failure', async () => {
      vi.mocked(writingService.expandScene).mockRejectedValue(new Error('Fail'));

      const result = await aiOperations.expandSceneAction('scene-1', 'more details');

      expect(result).toEqual({ error: 'Failed to expand scene. Please try again.' });
    });
  });

  describe('critiqueChapterAction', () => {
    it('should return data on success', async () => {
      vi.mocked(analysisService.critiqueChapter).mockResolvedValue({ critique: 'good' });

      const result = await aiOperations.critiqueChapterAction('chapter-1');

      expect(result).toEqual({ success: true, data: { critique: 'good' } });
    });

    it('should return friendly error on failure', async () => {
      vi.mocked(analysisService.critiqueChapter).mockRejectedValue(new Error('Fail'));

      const result = await aiOperations.critiqueChapterAction('chapter-1');

      expect(result).toEqual({
        success: false,
        error: 'Failed to analyze chapter. Please try again.',
      });
    });
  });

  describe('analyzeConsistencyAction', () => {
    it('should return data on success', async () => {
      vi.mocked(analysisService.analyzeConsistency).mockResolvedValue({ issues: [] });

      const result = await aiOperations.analyzeConsistencyAction('chapter-1');

      expect(result).toEqual({ success: true, data: { issues: [] } });
    });

    it('should return friendly error on failure', async () => {
      vi.mocked(analysisService.analyzeConsistency).mockRejectedValue(new Error('Fail'));

      const result = await aiOperations.analyzeConsistencyAction('chapter-1');

      expect(result).toEqual({
        success: false,
        error: 'Failed to check consistency. Please try again.',
      });
    });
  });

  describe('dialogueCoachAction', () => {
    it('should return report on success', async () => {
      vi.mocked(analysisService.dialogueCoach).mockResolvedValue({
        overview: 'Good flow',
        voiceNotes: [],
        quickFixes: [],
      });

      const result = await aiOperations.dialogueCoachAction('scene-1');

      // The action formats the report string, so we check for success and presence of a report string
      expect(result.success).toBe(true);
      expect(result.report).toContain('Overview: Good flow');
    });

    it('should return friendly error on failure', async () => {
      vi.mocked(analysisService.dialogueCoach).mockRejectedValue(new Error('Fail'));

      const result = await aiOperations.dialogueCoachAction('scene-1');

      expect(result).toEqual({
        success: false,
        error: 'Failed to analyze dialogue. Please try again.',
      });
    });
  });

  describe('generateLoreAction', () => {
    it('should return entity on success', async () => {
      const mockEntity = { id: '1', name: 'Hero', kind: 'character' } as any;
      vi.mocked(loreService.generateLore).mockResolvedValue(mockEntity);

      const result = await aiOperations.generateLoreAction('proj-1', 'Create a hero', 'character');

      expect(result).toEqual({ success: true, entity: mockEntity });
    });

    it('should return friendly error on failure', async () => {
      vi.mocked(loreService.generateLore).mockRejectedValue(new Error('Fail'));

      const result = await aiOperations.generateLoreAction('proj-1', 'prompt', 'character');

      expect(result).toEqual({
        success: false,
        error: 'Failed to generate lore. Please try again.',
      });
    });
  });

  describe('searchProjectAction', () => {
    it('should return answer on success', async () => {
      vi.mocked(loreService.searchProject).mockResolvedValue('Here is the info.');

      const result = await aiOperations.searchProjectAction('proj-1', 'Who is X?');

      expect(result).toEqual({ success: true, answer: 'Here is the info.' });
    });

    it('should return friendly error on failure', async () => {
      vi.mocked(loreService.searchProject).mockRejectedValue(new Error('Fail'));

      const result = await aiOperations.searchProjectAction('proj-1', 'query');

      expect(result).toEqual({
        success: false,
        error: 'Failed to search project.',
      });
    });
  });

  describe('askManuscriptAction', () => {
    it('should return response on success', async () => {
      vi.mocked(manuscriptService.askManuscript).mockResolvedValue({
        answer: 'The killer is Y.',
        sources: [],
      });

      const result = await aiOperations.askManuscriptAction('proj-1', 'Who did it?');

      expect(result.success).toBe(true);
      expect(result.response).toContain('The killer is Y.');
    });

    it('should return friendly error on failure', async () => {
      vi.mocked(manuscriptService.askManuscript).mockRejectedValue(new Error('Fail'));

      const result = await aiOperations.askManuscriptAction('proj-1', 'query');

      expect(result).toEqual({
        success: false,
        error: 'Failed to get answer from manuscript.',
      });
    });
  });
});
