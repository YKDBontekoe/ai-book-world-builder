
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { manageEntities } from '@/lib/ai/tools/manage-entities';
import { createEntity, updateEntity, getProjectByIdWithAccess, getEntityById } from '@/lib/db/queries';

// Mock dependencies
vi.mock('@/lib/db/queries', () => ({
  createEntity: vi.fn(),
  updateEntity: vi.fn(),
  createEntityAttribute: vi.fn(),
  getProjectByIdWithAccess: vi.fn(),
  getEntityById: vi.fn(),
}));

describe('manageEntities tool', () => {
  const mockOtherUserSession = {
    user: {
      id: 'user-attacker',
    },
    expires: '2099-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should FAIL to create entity when user does NOT own project', async () => {
    const projectId = 'project-victim';

    // Mock project owned by victim (not attacker)
    (getProjectByIdWithAccess as any).mockResolvedValue({
      id: projectId,
      userId: 'user-owner',
    });

    // createEntity would succeed if called (vulnerability)
    (createEntity as any).mockResolvedValue({
      id: 'entity-new',
      name: 'Malicious Entity',
    });

    const tool = manageEntities({ session: mockOtherUserSession as any, projectId }) as any;

    const result = await (tool.execute as any)({
      projectId, // explicit project ID override
      action: 'create',
      entities: [{ name: 'Malicious Entity', kind: 'character' }],
    }, {} as any);

    // Create check is global, so it returns a top-level error
    if (result.error) {
         expect(result.error).toMatch(/Unauthorized/i);
    } else {
         // If no top-level error, check results
         const firstResult = result.results?.[0];
         if (firstResult?.success) {
             throw new Error('VULNERABILITY DETECTED: Created entity in project not owned by user');
         }
         expect(firstResult?.error).toMatch(/Unauthorized/i);
    }
  });

  it('should FAIL to update entity when user does NOT own project', async () => {
    const entityId = 'entity-victim';
    const projectId = 'project-victim';

    // Mock entity belonging to victim project
    (getEntityById as any).mockResolvedValue({
      id: entityId,
      projectId: projectId,
      name: 'Victim Entity',
      userId: 'user-owner' // Some schemas have userId on entity too, but usually it's on project
    });

    // Mock project owned by victim
    (getProjectByIdWithAccess as any).mockResolvedValue({
      id: projectId,
      userId: 'user-owner',
    });

    (updateEntity as any).mockResolvedValue({
      id: entityId,
      name: 'Hacked Name',
    });

    const tool = manageEntities({ session: mockOtherUserSession as any });

    const result = await (tool.execute as any)({
      action: 'update',
      entities: [{ id: entityId, name: 'Hacked Name' }],
    }, {} as any);

    // Update check is per-entity, so it returns error in results
    const firstResult = result.results?.[0];

    if (firstResult?.success) {
        throw new Error('VULNERABILITY DETECTED: Updated entity not owned by user');
    }

    expect(firstResult?.error).toMatch(/Unauthorized/i);
  });
});
