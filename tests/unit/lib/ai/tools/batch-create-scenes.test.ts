import { describe, it, expect, vi, beforeEach } from 'vitest';
import { batchCreateScenes } from '@/lib/ai/tools/batch-create-scenes';
import { projectRepository, sceneRepository } from '@/lib/db/repositories';

// Mock repositories
vi.mock('@/lib/db/repositories', () => ({
  projectRepository: {
    findByIdWithOwnership: vi.fn(),
  },
  sceneRepository: {
    create: vi.fn(),
  },
}));

describe('batchCreateScenes tool', () => {
  const mockSession = {
    user: {
      id: 'user-1',
      email: 'test@example.com',
    },
    expires: '2025-01-01',
  };

  const validArgs = {
    chapterId: 'chapter-1',
    projectId: 'project-1',
    scenes: [
      {
        title: 'Scene 1',
        sequence: 1,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should verify project ownership before creating scenes', async () => {
    // Setup: projectRepository.findByIdWithOwnership throws error (simulating no access)
    vi.mocked(projectRepository.findByIdWithOwnership).mockRejectedValue(new Error('Forbidden'));

    // execute call signature changed with createProtectedTool wrapper
    // wrapper handles session/projectId and calls our inner execute
    // But for testing the tool export directly, we call it via the SDK wrapper pattern or invoke the inner function if exposed?
    // The export is: export const batchCreateScenes = createProtectedTool({...})
    // tool() returns { execute: ... }

    // We need to pass the context object as the second argument if we are calling the execute function directly
    // Wait, createProtectedTool returns a function that takes { session, projectId } and returns the tool definition
    // So `batchCreateScenes` is NOT the tool definition, it's a factory function?

    // Let's check tool-utils.ts:
    // export function createProtectedTool(...) { return ({ session, projectId }) => tool({...}) }

    // So batchCreateScenes is a function.
    const toolInstance = batchCreateScenes({ session: mockSession, projectId: 'project-1' });

    // Now toolInstance has .execute(args)
    // The wrapper inside createProtectedTool calls our inner execute.

    // Execute
    const result = await toolInstance.execute(validArgs);

    // Assert: Check that we tried to verify ownership
    expect(projectRepository.findByIdWithOwnership).toHaveBeenCalledWith('project-1', 'user-1');

    // Assert: Should return error because ownership check failed
    // The wrapper catches errors and returns { error: ... }
    expect(result).toHaveProperty('error');
    // The wrapper prefixes "Tool execution failed..." or returns the error message
    // Our inner execute allows the error to bubble up, wrapper catches it.
    expect(result.error).toBe('Forbidden');

    // Assert: Should NOT have created any scenes
    expect(sceneRepository.create).not.toHaveBeenCalled();
  });

  it('should create scenes if ownership is verified', async () => {
    // Setup: projectRepository.findByIdWithOwnership succeeds
    vi.mocked(projectRepository.findByIdWithOwnership).mockResolvedValue({ id: 'project-1', userId: 'user-1' } as any);
    vi.mocked(sceneRepository.create).mockResolvedValue({ id: 'scene-1', title: 'Scene 1' } as any);

    const toolInstance = batchCreateScenes({ session: mockSession, projectId: 'project-1' });

    // Execute
    const result = await toolInstance.execute(validArgs);

    // Assert
    expect(projectRepository.findByIdWithOwnership).toHaveBeenCalledWith('project-1', 'user-1');
    expect(sceneRepository.create).toHaveBeenCalled();
    expect(result).not.toHaveProperty('error');
    expect(result).toHaveProperty('results');
  });
});
