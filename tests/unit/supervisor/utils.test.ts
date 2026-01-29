import { describe, it, expect } from "vitest";
import { getAuthorType } from "../../../.github/scripts/supervisor/utils";

describe("getAuthorType", () => {
  it("detects jules bots", () => {
    expect(getAuthorType("google-labs-jules")).toBe("jules");
    expect(getAuthorType("jules")).toBe("jules");
  });

  it("detects other bots", () => {
    expect(getAuthorType("renovate[bot]")).toBe("bot");
    expect(getAuthorType("dependabot[bot]")).toBe("bot");
    expect(getAuthorType("some-bot[bot]")).toBe("bot");
  });

  it("detects humans", () => {
    expect(getAuthorType("user")).toBe("human");
    expect(getAuthorType("torvalds")).toBe("human");
  });
});
