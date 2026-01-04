
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CommentSection } from "@/components/admin/github/comment-section";
import { getComments } from "@/app/actions/github";
import { useQuery } from "@tanstack/react-query";

// Mock dependencies
vi.mock("@/app/actions/github", () => ({
  getComments: vi.fn(),
  postComment: vi.fn(),
}));

// Mock @tanstack/react-query
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: () => ({
      mutate: vi.fn(),
      isPending: false,
    }),
    useQueryClient: () => ({
      invalidateQueries: vi.fn(),
    }),
  };
});

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock streamdown since it's used in Response component
vi.mock("streamdown", () => ({
  Streamdown: ({ children }: { children: React.ReactNode }) => <div data-testid="streamdown-mock">{children}</div>,
}));

describe("CommentSection", () => {
  const mockComments = [
    {
      id: 1,
      body: "**Bold text** and *italic text*",
      created_at: new Date().toISOString(),
      user: {
        login: "testuser",
        avatar_url: "https://example.com/avatar.png",
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders comments using Markdown", () => {
    // Setup mock return values
    (useQuery as any).mockReturnValue({
      data: { success: true, data: mockComments },
      isLoading: false,
      error: null,
    });

    render(<CommentSection issueNumber={123} />);

    // Check if the comment body is rendered inside the Streamdown mock
    const streamdownMock = screen.queryByTestId("streamdown-mock");
    expect(streamdownMock).toBeInTheDocument();
    expect(screen.getByText("**Bold text** and *italic text*")).toBeInTheDocument();
  });
});
