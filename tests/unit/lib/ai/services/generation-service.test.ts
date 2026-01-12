import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GenerationService } from '@/lib/ai/services/generation-service';

// Mock dependencies
vi.mock('@/lib/ai/services/ai-client', () => ({
  aiClient: {
    generateText: vi.fn(),
  },
}));

vi.mock('@/lib/ai/model-routing', () => ({
  getModelIdForRole: vi.fn().mockResolvedValue('mock-model-id'),
  getModelIdForTier: vi.fn().mockResolvedValue('mock-model-id'),
}));

vi.mock('@/lib/ai/prompts/writer-prompts', () => ({
  writerPrompts: {
    continueWriting: {
      system: vi.fn(() => 'system prompt'),
      user: vi.fn(() => 'user prompt'),
    },
    draftScene: {
      system: vi.fn(() => 'system prompt'),
      user: vi.fn(() => 'user prompt'),
    },
    generateIdeas: {
      system: vi.fn(() => 'system prompt'),
      user: vi.fn(() => 'user prompt'),
    },
    rewriteSelection: {
      system: vi.fn(() => 'system prompt'),
      user: vi.fn(() => 'user prompt'),
    },
    rewriteScene: {
      system: vi.fn(() => 'system prompt'),
      user: vi.fn(() => 'user prompt'),
    },
    expandScene: {
      system: vi.fn(() => 'system prompt'),
      user: vi.fn(() => 'user prompt'),
    },
  },
}));

import { aiClient } from '@/lib/ai/services/ai-client';
import { writerPrompts } from '@/lib/ai/prompts/writer-prompts';

describe('GenerationService', () => {
  let service: GenerationService;

  beforeEach(() => {
    service = new GenerationService();
    vi.clearAllMocks();
  });

  describe('rewriteScene', () => {
    it('should call generateText with correct prompts', async () => {
      const mockResult = {
        success: true,
        data: { text: 'Rewritten text' },
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        modelId: 'mock-model-id',
      };

      vi.mocked(aiClient.generateText).mockResolvedValue(mockResult);

      const result = await service.rewriteScene('Title', 'Content', 'Instructions');

      expect(writerPrompts.rewriteScene.system).toHaveBeenCalled();
      expect(writerPrompts.rewriteScene.user).toHaveBeenCalledWith({
        sceneTitle: 'Title',
        currentContent: 'Content',
        instructions: 'Instructions',
      });

      expect(aiClient.generateText).toHaveBeenCalledWith(expect.objectContaining({
        prompt: 'user prompt',
        options: expect.objectContaining({
            system: 'system prompt',
            modelRole: 'writer'
        })
      }));

      expect(result).toEqual({
        text: 'Rewritten text',
        usage: mockResult.usage,
        modelId: 'mock-model-id',
      });
    });

    it('should handle failure', async () => {
       vi.mocked(aiClient.generateText).mockResolvedValue({
        success: false,
        error: 'AI Error',
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        modelId: 'mock-model-id',
      });

      const result = await service.rewriteScene('Title', 'Content', 'Instructions');
      expect(result).toEqual({ error: 'AI Error' });
    });
  });

  describe('expandScene', () => {
    it('should call generateText with correct prompts', async () => {
      const mockResult = {
        success: true,
        data: { text: 'Expanded text' },
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        modelId: 'mock-model-id',
      };

      vi.mocked(aiClient.generateText).mockResolvedValue(mockResult);

      const result = await service.expandScene('Title', 'Notes');

      expect(writerPrompts.expandScene.system).toHaveBeenCalled();
      expect(writerPrompts.expandScene.user).toHaveBeenCalledWith({
        sceneTitle: 'Title',
        notes: 'Notes',
      });

      expect(aiClient.generateText).toHaveBeenCalledWith(expect.objectContaining({
        prompt: 'user prompt',
        options: expect.objectContaining({
            system: 'system prompt',
            modelRole: 'writer'
        })
      }));

      expect(result).toEqual({
        text: 'Expanded text',
        usage: mockResult.usage,
        modelId: 'mock-model-id',
      });
    });
  });
});
