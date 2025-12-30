import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProjectsLoading from '@/app/(chat)/projects/loading';

// Mock components to simplify testing
// The real Skeleton component passes down extra props like data-testid. We replicate that here.
vi.mock('@/components/atoms/skeleton', () => ({
	Skeleton: ({ className, ...props }: { className: string; [key: string]: unknown }) => (
		<div data-testid="skeleton" className={className} {...props} />
	),
}));

vi.mock('@/components/molecules/glass-card', () => ({
	GlassCard: ({ children, className }: { children: React.ReactNode; className?: string; variant?: string }) => (
		<div data-testid="glass-card" className={className}>
			{children}
		</div>
	),
}));

describe('ProjectsLoading', () => {
	it('renders exactly 2 page header skeletons', () => {
		render(<ProjectsLoading />);
		const header = screen.getByTestId('projects-header-skeleton');
		const skeletons = within(header).getAllByTestId('skeleton');
		expect(skeletons.length).toBe(2);
	});

	it('renders toolbar skeleton with search and actions', () => {
		render(<ProjectsLoading />);

		const searchSkeleton = screen.getByTestId('project-search-skeleton');
		expect(searchSkeleton).toBeInTheDocument();

		const actions = screen.getByTestId('project-actions-skeleton');
		const actionSkeletons = within(actions).getAllByTestId('skeleton');
		expect(actionSkeletons.length).toBe(4);
	});

	it('renders exactly 8 project card skeletons', () => {
		render(<ProjectsLoading />);
		const cards = screen.getAllByTestId('glass-card');
		expect(cards.length).toBe(8);
	});
});
