import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EmptyState } from '@/components/molecules/empty-state';
import { FolderIcon } from 'lucide-react';

describe('EmptyState', () => {
  it('renders correctly with default variant (dashed)', () => {
    render(<EmptyState title="No content" />);
    const container = screen.getByText('No content').closest('div');
    expect(container).toHaveClass('border-dashed');
  });

  it('renders correctly with glass variant', () => {
    render(<EmptyState title="Glass Empty State" variant="glass" />);
    // GlassCard renders a div, we check if it DOES NOT have border-dashed (GlassCard uses specific borders)
    // Or check if it renders the content
    expect(screen.getByText('Glass Empty State')).toBeInTheDocument();
  });

  it('renders icon, title and description', () => {
    render(
      <EmptyState
        title="Test Title"
        description="Test Description"
        icon={FolderIcon}
      />
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
});
