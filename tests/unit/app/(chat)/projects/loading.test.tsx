import { render, screen, within } from '@testing-library/react';
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
	it('renders exactly 2 skeletons in the page header', () => {
		render(<ProjectsLoading />);
		const header = screen.getByTestId('projects-header-skeleton');
		const headerSkeletons = within(header).getAllByTestId('skeleton');
		expect(headerSkeletons.length).toBe(2);
	});

	it('renders toolbar skeleton with search and 4 action skeletons', () => {
		render(<ProjectsLoading />);

		// Verify search skeleton
		const allSkeletons = screen.getAllByTestId('skeleton');
		const searchSkeleton = allSkeletons.find((s) => s.className.includes('max-w-md'));
		expect(searchSkeleton).toBeDefined();

		// Verify action skeletons
		const actionsContainer = screen.getByTestId('project-actions-skeleton');
		const actionSkeletons = within(actionsContainer).getAllByTestId('skeleton');
		expect(actionSkeletons.length).toBe(4);
	});

	it('renders exactly 8 project card skeletons', () => {
		render(<ProjectsLoading />);
		const cards = screen.getAllByTestId('glass-card');
		expect(cards.length).toBe(8);
	});
});
