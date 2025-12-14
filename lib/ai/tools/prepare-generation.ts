import { z } from 'zod';

export const prepareGeneration = {
  description: 'Propose a book generation task based on the current conversation context. Use this when the user is ready to start writing or drafting a chapter/scene.',
  parameters: z.object({
    projectId: z.string().describe('The ID of the project'),
    title: z.string().describe('The title of the generation task (e.g., "Draft Chapter 5")'),
    focus: z.string().describe('A detailed description of what should be generated (summary, instructions, tone)'),
    suggestedEntityIds: z.array(z.string()).optional().describe('List of entity IDs relevant to this generation'),
    suggestedSceneIds: z.array(z.string()).optional().describe('List of scene IDs relevant to this generation'),
    suggestedChapterId: z.string().optional().describe('The chapter ID if specific'),
  }),
};
