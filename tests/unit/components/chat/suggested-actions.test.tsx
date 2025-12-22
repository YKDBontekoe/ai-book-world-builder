import { render, screen } from '@testing-library/react';
import { SuggestedActions } from '@/components/organisms/chat/suggested-actions';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
vi.mock('@/lib/api-client', () => ({
  api: {
    post: vi.fn(),
  },
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.join(' '),
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const defaultProps = {
  chatId: 'test-chat-id',
  sendMessage: vi.fn(),
  selectedVisibilityType: 'private' as const,
  messages: [],
  selectedModelId: 'gpt-4o' as const,
  isCompact: false,
};

describe('SuggestedActions', () => {
  it('renders grid with correct classes', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SuggestedActions {...defaultProps} />
      </QueryClientProvider>
    );

    const container = screen.getByTestId('suggested-actions');
    // We expect the class to contain the new grid definition
    expect(container.className).toContain('grid-cols-[repeat(auto-fit,minmax(260px,1fr))]');
  });
});
