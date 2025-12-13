import { render, screen } from '@testing-library/react';
import { GlassCard } from '@/components/ui/glass-card';
import { describe, it, expect } from 'vitest';

describe('GlassCard', () => {
  it('renders correctly with default props', () => {
    render(<GlassCard>Test Content</GlassCard>);
    const card = screen.getByText('Test Content');
    expect(card).toBeInTheDocument();
    // Use class list checking more robustly if needed, but exact string match via toHaveClass is fine
    expect(card.className).toContain('backdrop-blur-[40px]');
    expect(card.className).toContain('border-glass-border');
    expect(card.className).toContain('bg-glass');
  });

  it('renders correctly with liquid variant', () => {
    render(<GlassCard variant="liquid">Liquid Content</GlassCard>);
    const card = screen.getByText('Liquid Content');
    expect(card.className).toContain('hover:bg-glass');
    expect(card.className).toContain('hover:scale-[1.01]');
  });

  it('renders correctly with interactive prop', () => {
    render(<GlassCard interactive>Interactive Content</GlassCard>);
    const card = screen.getByText('Interactive Content');
    expect(card.className).toContain('cursor-pointer');
    expect(card.className).toContain('hover:bg-glass-input/80');
  });
});
