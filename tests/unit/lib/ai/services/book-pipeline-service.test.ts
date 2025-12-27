
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { bookPipelineService } from '@/lib/ai/services/book-pipeline-service';
import { db } from '@/lib/db/drizzle';

// Spy on AI methods
const generateObjectSpy = vi.spyOn(bookPipelineService as any, 'generateObjectWithSystem');
const generateTextSpy = vi.spyOn(bookPipelineService as any, 'generateTextWithSystem');

describe('BookPipelineService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default DB mocks to chainable
        (db.select as any).mockReturnThis();
        (db.from as any).mockReturnThis();
        (db.where as any).mockReturnThis();
        (db.limit as any).mockReturnThis();
    });

    describe('Quality Gate Logic', () => {
        it('should approve content with high score (8+)', async () => {
            // Mock AI response
            generateObjectSpy.mockResolvedValue({
                success: true,
                data: {
                    object: {
                        overallScore: 9,
                        score: 9, // Schema likely uses 'score' or 'overallScore' - checked code, it extracts { score, issues }
                        issues: [],
                        recommendation: 'approve',
                        strengths: ['Great pacing']
                    }
                }
            } as any);

            // Access private method via casting
            const result = await (bookPipelineService as any).runQualityGate(
                'gen-1',
                { id: 'step-1' },
                { content: 'Chapter content...' }
            );

            expect(result.passed).toBe(true);
            expect(result.recommendation).toBe('approve');
        });

        it('should recommend minor revision for score 6-7', async () => {
            generateObjectSpy.mockResolvedValue({
                success: true,
                data: {
                    object: {
                        score: 7,
                        issues: [],
                        recommendation: 'minor_revision'
                    }
                }
            } as any);

            const result = await (bookPipelineService as any).runQualityGate(
                'gen-1',
                { id: 'step-1' },
                { content: 'Chapter content...' }
            );

            expect(result.passed).toBe(true); // Assuming 6 is pass threshold
            expect(result.recommendation).toBe('minor_revision');
        });

        it('should fail and recommend major revision for score 4-5', async () => {
            generateObjectSpy.mockResolvedValue({
                success: true,
                data: {
                    object: {
                        score: 5,
                        issues: [{ type: 'pacing', severity: 'moderate' }],
                        recommendation: 'major_revision'
                    }
                }
            } as any);

            const result = await (bookPipelineService as any).runQualityGate(
                'gen-1',
                { id: 'step-1' },
                { content: 'Chapter content...' }
            );

            expect(result.passed).toBe(false);
            expect(result.recommendation).toBe('major_revision');
        });

        it('should fail and recommend REWRITE for score < 4', async () => {
            generateObjectSpy.mockResolvedValue({
                success: true,
                data: {
                    object: {
                        score: 3,
                        issues: [{ type: 'consistency', severity: 'major' }],
                        recommendation: 'rewrite'
                    }
                }
            } as any);

            const result = await (bookPipelineService as any).runQualityGate(
                'gen-1',
                { id: 'step-1' },
                { content: 'Chapter content...' }
            );

            expect(result.passed).toBe(false);
            expect(result.recommendation).toBe('rewrite');
        });
    });
});
