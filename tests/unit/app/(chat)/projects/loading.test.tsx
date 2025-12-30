import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProjectsLoading from '@/app/(chat)/projects/loading';

// Mock components to simplify testing
vi.mock('@/components/atoms/skeleton', () => ({
  Skeleton: ({ className }: { className: string }) => <div data-testid="skeleton" className={className} />,
}));

vi.mock('@/components/molecules/glass-card', () => ({
  GlassCard: ({ children, className }: { children: React.ReactNode; className: string }) => (
    <div data-testid="glass-card" className={className}>
      {children}
    </div>
  ),
}));

describe('ProjectsLoading', () => {
  it('renders the project browser toolbar skeleton', () => {
    render(<ProjectsLoading />);

    // Check for search bar skeleton (max-w-md)
    const skeletons = screen.getAllByTestId('skeleton');
    const searchSkeleton = skeletons.find(s => s.className.includes('max-w-md'));
    expect(searchSkeleton).toBeDefined();

    // Check for grid items
    const cards = screen.getAllByTestId('glass-card');
    expect(cards.length).toBeGreaterThan(0);
  });
});
