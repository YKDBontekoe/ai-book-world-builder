
import { describe, it, expect, vi } from "vitest";
import { safeQuery } from "@/lib/db/safe-query";
import { ChatSDKError } from "@/lib/errors";

describe("safeQuery", () => {
  it("should return the result of the query function", async () => {
    const mockFn = vi.fn().mockResolvedValue("success");
    const result = await safeQuery(mockFn, { errorMessage: "fail" });
    expect(result).toBe("success");
  });

  it("should rethrow ChatSDKError", async () => {
    const error = new ChatSDKError("bad_request:api", "Custom error");
    const mockFn = vi.fn().mockRejectedValue(error);

    await expect(safeQuery(mockFn, { errorMessage: "fail" })).rejects.toThrow(
      error
    );
  });

  it("should wrap unknown errors in ChatSDKError", async () => {
    const error = new Error("Unknown error");
    const mockFn = vi.fn().mockRejectedValue(error);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      safeQuery(mockFn, { errorMessage: "Wrapped error" })
    ).rejects.toThrow(ChatSDKError);

    // Check if it threw with correct message
    await expect(
        safeQuery(mockFn, { errorMessage: "Wrapped error" })
      ).rejects.toThrow("Wrapped error");

    expect(consoleSpy).toHaveBeenCalled();
  });
});
