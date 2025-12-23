
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { updateDocument } from '@/lib/ai/tools/update-document';
import { getDocumentById } from '@/lib/db/queries';

// Mock dependencies
vi.mock('@/lib/db/queries', () => ({
  getDocumentById: vi.fn(),
}));

vi.mock('@/lib/artifacts/server', () => ({
  documentHandlersByArtifactKind: [
    {
      kind: 'text',
      onUpdateDocument: vi.fn(),
    },
  ],
}));

describe('updateDocument tool', () => {
  const mockSession = {
    user: {
      id: 'user-123',
    },
    expires: 'new-date',
  };

  const mockDataStream = {
    write: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow updating a document owned by the user', async () => {
    const documentId = 'doc-123';
    const mockDocument = {
      id: documentId,
      userId: 'user-123', // Owned by session user
      kind: 'text',
      title: 'My Doc',
    };

    (getDocumentById as any).mockResolvedValue(mockDocument);

    const tool = updateDocument({ session: mockSession as any, dataStream: mockDataStream as any }) as any;
    const result = await tool.execute({ id: documentId, description: 'update it' }, {} as any);

    expect(getDocumentById).toHaveBeenCalledWith({ id: documentId });
    expect(result).toHaveProperty('content', 'The document has been updated successfully.');
  });

  it('should PREVENT updating a document NOT owned by the user', async () => {
    const documentId = 'doc-456';
    const mockDocument = {
      id: documentId,
      userId: 'user-OTHER', // NOT owned by session user
      kind: 'text',
      title: 'Other Doc',
    };

    (getDocumentById as any).mockResolvedValue(mockDocument);

    const tool = updateDocument({ session: mockSession as any, dataStream: mockDataStream as any }) as any;

    // In the vulnerable version, this will resolve successfully (fail security test)
    // In the fixed version, this should return an error
    const result = await tool.execute({ id: documentId, description: 'hack it' }, {} as any);

    // EXPECTATION: The fixed tool should return an error
    expect(result).toHaveProperty('error', 'Unauthorized');
  });
});
