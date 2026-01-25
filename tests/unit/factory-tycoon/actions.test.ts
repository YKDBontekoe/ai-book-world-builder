import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveGameState } from '../../../src/features/factory-tycoon/actions';
import { INITIAL_STATE } from '../../../src/features/factory-tycoon/config';
import { auth } from '@/app/(auth)/auth';

// Mock Auth
vi.mock('@/app/(auth)/auth', () => ({
  auth: vi.fn(),
}));

// Mock DB
const mockFindFirst = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockSet = vi.fn();
const mockWhere = vi.fn();
const mockValues = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      factoryTycoonSaves: {
        findFirst: (...args: any[]) => mockFindFirst(...args),
      },
    },
    insert: () => ({ values: mockValues }),
    update: () => ({ set: mockSet }),
  },
}));

describe('Factory Tycoon Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup successful auth
        (auth as any).mockResolvedValue({ user: { id: 'user-1' } });

        // Setup chainable mocks
        mockSet.mockReturnValue({ where: mockWhere });
    });

    it('saveGameState should reject invalid schema (wrong type)', async () => {
        const invalidState = { ...INITIAL_STATE, cash: 'LOTS OF MONEY' }; // Invalid string
        const result = await saveGameState(invalidState as any);

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toBeDefined();
            // Zod error usually says "Expected number, received string"
        }
    });

    it('saveGameState should reject missing required fields', async () => {
        const invalidState = { cash: 100 }; // Missing everything else
        const result = await saveGameState(invalidState as any);

        expect(result.success).toBe(false);
    });

    it('saveGameState should insert new save when none exists', async () => {
        mockFindFirst.mockResolvedValue(null);
        mockValues.mockResolvedValue({});

        const result = await saveGameState(INITIAL_STATE);

        expect(result.success).toBe(true);
        expect(mockFindFirst).toHaveBeenCalled();
        expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
            userId: 'user-1',
            state: INITIAL_STATE
        }));
    });

    it('saveGameState should update save when it exists', async () => {
        mockFindFirst.mockResolvedValue({ id: 'save-1', userId: 'user-1' });
        mockWhere.mockResolvedValue({});

        const result = await saveGameState(INITIAL_STATE);

        expect(result.success).toBe(true);
        expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
            state: INITIAL_STATE
        }));
        expect(mockWhere).toHaveBeenCalled();
    });
});
