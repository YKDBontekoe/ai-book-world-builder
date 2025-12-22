import { render, screen } from '@testing-library/react';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { describe, it, expect } from 'vitest';
import React from 'react';

// Mock ResizeObserver for Radix UI if needed, but for simple rendering it might be fine.
// If not, we can add a setup file.

describe('Primitives Overhaul', () => {
  describe('Button', () => {
    it('renders glass variant correctly', () => {
      render(<Button variant="glass">Glass Button</Button>);
      const button = screen.getByRole('button', { name: /glass button/i });
      expect(button).toHaveClass('glass');
    });

    it('renders pill size correctly', () => {
      render(<Button size="pill">Pill Button</Button>);
      const button = screen.getByRole('button', { name: /pill button/i });
      expect(button).toHaveClass('rounded-full');
    });
  });

  describe('Input', () => {
    it('has glass-input class by default', () => {
      render(<Input placeholder="Test Input" />);
      const input = screen.getByPlaceholderText('Test Input');
      expect(input).toHaveClass('glass-input');
      expect(input).toHaveClass('transition-all');
    });
  });
});
