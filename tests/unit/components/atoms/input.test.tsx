import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from '@/components/atoms/input';

describe('Input', () => {
  it('renders clear button when onClear is provided and value is present', () => {
    const handleClear = vi.fn();
    render(<Input value="test" onChange={() => {}} onClear={handleClear} />);

    const clearButton = screen.getByLabelText('Clear input');
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    expect(handleClear).toHaveBeenCalled();
  });

  it('does not render clear button when value is empty', () => {
    const handleClear = vi.fn();
    render(<Input value="" onChange={() => {}} onClear={handleClear} />);

    const clearButton = screen.queryByLabelText('Clear input');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('does not render clear button when onClear is not provided', () => {
    render(<Input value="test" onChange={() => {}} />);

    const clearButton = screen.queryByLabelText('Clear input');
    expect(clearButton).not.toBeInTheDocument();
  });
});
