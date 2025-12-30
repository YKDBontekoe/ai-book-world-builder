import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProjectsLoading from '@/app/(chat)/projects/loading';

// Mock components to simplify testing
vi.mock('@/components/atoms/skeleton', () => ({
	Skeleton: ({ className }: { className: string }) => <div data-testid="skeleton" className={className} />,
}));

vi.mock('@/components/molecules/glass-card', () => ({
	GlassCard: ({ children, className }: { children: React.ReactNode; className?: string; variant?: string }) => (
		<div data-testid="glass-card" className={className}>
			{children}
		</div>
	),
}));

describe('ProjectsLoading', () => {
	it('renders page header skeleton', () => {
		render(<ProjectsLoading />);
		const skeletons = screen.getAllByTestId('skeleton');
		// Verify header skeletons for title and action button
		expect(skeletons.length).toBeGreaterThanOrEqual(2);
	});

	it('renders toolbar skeleton with search and actions', () => {
		render(<ProjectsLoading />);

		const skeletons = screen.getAllByTestId('skeleton');
		const searchSkeleton = skeletons.find((s) => s.className.includes('max-w-md'));
		expect(searchSkeleton).toBeDefined();

		// Verify action skeletons are present
		const actionSkeletons = skeletons.filter(
			(s) =>
				s.className.includes('w-[140px]') ||
				s.className.includes('w-[180px]') ||
				s.className.includes('h-7 w-7'),
		);
		expect(actionSkeletons.length).toBeGreaterThanOrEqual(3);
	});

	it('renders exactly 8 project card skeletons', () => {
		render(<ProjectsLoading />);
		const cards = screen.getAllByTestId('glass-card');
		expect(cards.length).toBe(8);
	});
});
