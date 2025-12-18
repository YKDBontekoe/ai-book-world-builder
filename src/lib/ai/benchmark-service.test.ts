// @vitest-environment node
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { fetchExternalBenchmarks } from "./benchmark-service";

// Mock fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe("fetchExternalBenchmarks", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    fetchMock.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("should fetch from default GitHub URL when API URL is not set", async () => {
    delete process.env.BENCHMARK_API_URL;

    const mockData = [
      { modelId: "default-model", eloScore: 1100, writingElo: 1100 }
    ];

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const benchmarks = await fetchExternalBenchmarks();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://raw.githubusercontent.com/YKDBontekoe/ai-book-world-builder/main/public/data/benchmarks.json",
      expect.anything()
    );
    expect(benchmarks).toEqual(mockData);
  });

  it("should fetch from API when BENCHMARK_API_URL is set", async () => {
    process.env.BENCHMARK_API_URL = "https://api.example.com/benchmarks";

    const mockData = [
      { modelId: "test-model", eloScore: 1000, writingElo: 1000 }
    ];

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const benchmarks = await fetchExternalBenchmarks();

    expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/benchmarks", expect.anything());
    expect(benchmarks).toEqual(mockData);
  });

  it("should handle API errors gracefully", async () => {
    process.env.BENCHMARK_API_URL = "https://api.example.com/benchmarks";

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    const benchmarks = await fetchExternalBenchmarks();

    expect(benchmarks).toEqual([]);
  });

  it("should handle invalid API data", async () => {
    process.env.BENCHMARK_API_URL = "https://api.example.com/benchmarks";

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invalid: "data" }), // Not an array
    });

    const benchmarks = await fetchExternalBenchmarks();

    expect(benchmarks).toEqual([]);
  });
});
