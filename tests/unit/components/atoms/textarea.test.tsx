import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Textarea } from '@/components/atoms/textarea';

describe('Textarea', () => {
  it('submits form on Enter when submitOnEnter is true', () => {
    const requestSubmitMock = vi.fn();

    render(
      <form ref={(el) => { if (el) el.requestSubmit = requestSubmitMock; }}>
        <Textarea submitOnEnter />
      </form>
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(requestSubmitMock).toHaveBeenCalled();
  });

  it('does not submit on Shift+Enter', () => {
    const requestSubmitMock = vi.fn();

    render(
      <form ref={(el) => { if (el) el.requestSubmit = requestSubmitMock; }}>
        <Textarea submitOnEnter />
      </form>
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true, code: 'Enter', charCode: 13 });

    expect(requestSubmitMock).not.toHaveBeenCalled();
  });
});
