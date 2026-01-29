import { describe, it, expect } from "vitest";
import { parseCodecovComment } from "../../../.github/scripts/supervisor/codecov";

describe("Codecov Parser", () => {
  it("should parse a standard table with drops", () => {
    const body = `
## Codecov Report
| [Files](...) | Coverage | Change |
| :--- | :--- | :--- |
| [src/foo.ts](http://foo) | 50% | -10% |
| [src/bar.ts](http://bar) | 80% | +1% |
`;
    const result = parseCodecovComment(body);
    expect(result).toContain("src/foo.ts (Coverage drop: -10%)");
    expect(result).toContain("- src/bar.ts");
  });

  it("should ignore headers", () => {
      const body = `| [Files](...) | Coverage | Change |`;
      const result = parseCodecovComment(body);
      expect(result).toBeNull();
  });

  it("should return null if no file rows", () => {
    const body = "Just some text";
    const result = parseCodecovComment(body);
    expect(result).toBeNull();
  });
});
