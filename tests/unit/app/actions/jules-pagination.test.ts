
import { describe, it, expect, vi } from "vitest";
import { listJulesSourcesAction } from "@/app/actions/jules";

// Use vi.hoisted to ensure mock is initialized before imports
const mocks = vi.hoisted(() => {
  return {
    listSources: vi.fn(),
  };
});

vi.mock("@/lib/jules-client", () => {
  return {
    JulesClient: class JulesClient {
      listSources = mocks.listSources;
    },
  };
});

// Mock action-middleware
vi.mock("@/lib/action-middleware", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/action-middleware")>();
  return {
    ...actual,
    createAdminAction: vi.fn().mockImplementation((config) => {
      return async (args: any) => {
          return config.handler(args || {});
      };
    }),
  };
});

describe("listJulesSourcesAction", () => {
  it("should paginate sources correctly", async () => {
    // Reset mock
    mocks.listSources.mockReset();

    // Mock first page
    mocks.listSources.mockResolvedValueOnce({
      sources: [{ id: "1" }],
      nextPageToken: "page2",
    });
    // Mock second page
    mocks.listSources.mockResolvedValueOnce({
      sources: [{ id: "2" }],
      nextPageToken: undefined,
    });

    const result = await listJulesSourcesAction();

    expect(mocks.listSources).toHaveBeenCalledTimes(2);
    expect(mocks.listSources).toHaveBeenNthCalledWith(1, 50, undefined);
    expect(mocks.listSources).toHaveBeenNthCalledWith(2, 50, "page2");
    expect(result).toEqual([{ id: "1" }, { id: "2" }]);
  });

  it("should stop pagination if max pages limit is reached", async () => {
      // Reset mock
      mocks.listSources.mockReset();

      // Always return a next page token to simulate infinite loop
      mocks.listSources.mockResolvedValue({
        sources: [{ id: "x" }],
        nextPageToken: "next-token",
      });

      // Spy on console.warn
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Call the action
      const result = await listJulesSourcesAction();

      expect(mocks.listSources).toHaveBeenCalledTimes(1000);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Hit max pages limit"));
      expect(result).toHaveLength(1000);

      consoleSpy.mockRestore();
  }, 10000); // Increase timeout
});
