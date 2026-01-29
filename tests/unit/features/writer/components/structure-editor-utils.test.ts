import { describe, expect, it } from "vitest";
import {
	parseStructure,
	smartFormat,
} from "@/features/writer/components/structure-editor-utils";

describe("Structure Editor Utils", () => {
	describe("smartFormat", () => {
		it("formats loose text into chapters and scenes", () => {
			const input = `Prologue
First Scene
Chapter 1: The Start
Scene: Moving on
Just some action`;

			// Note: smartFormat adds a blank line before new chapters
			const expected = `Chapter 1: Prologue
  Scene 1: First Scene

Chapter 2: The Start
  Scene 1: Moving on
  Scene 2: Just some action`;

			expect(smartFormat(input)).toBe(expected);
		});

		it("preserves existing structure", () => {
			// Note: existing structure without blank lines might get a blank line inserted if processed as "Chapter",
			// but here input starts with Chapter 1.
			// smartFormat implementation creates a new array.
			// It pushes "Chapter 1: One".
			// Then "Scene 1: Scene One".
			// It assumes reformattedLines.join("\n").
			// If the input doesn't have blank lines, the output won't have them between Ch1 and Sc1.

			const input = `Chapter 1: One
  Scene 1: Scene One`;
			expect(smartFormat(input)).toBe(input);
		});

		it("handles different scene markers", () => {
			const input = `Chapter 1
- Scene A
* Scene B`;
			// smartFormat strips "Scene" keyword
			const expected = `Chapter 1: Untitled Chapter
  Scene 1: A
  Scene 2: B`;
			expect(smartFormat(input)).toBe(expected);
		});
	});

	describe("parseStructure", () => {
		it("parses chapters and scenes correctly", () => {
			const input = `Chapter 1: One
  Scene 1: A
  Scene 2: B
Chapter 2: Two`;
			const result = parseStructure(input);

			expect(result).toHaveLength(2);
			expect(result[0].type).toBe("chapter");
			expect(result[0].title).toBe("Chapter 1: One");
			expect(result[0].children).toHaveLength(2);
			// parseStructure does NOT strip "Scene X:" prefix
			expect(result[0].children?.[0].title).toBe("Scene 1: A");
			expect(result[0].children?.[1].title).toBe("Scene 2: B");
			expect(result[1].type).toBe("chapter");
			expect(result[1].title).toBe("Chapter 2: Two");
			expect(result[1].children).toHaveLength(0);
		});

		it("handles root level scenes as unknown", () => {
			const input = `Scene: Lonely`;
			const result = parseStructure(input);
			expect(result).toHaveLength(1);
			expect(result[0].type).toBe("unknown");
			expect(result[0].title).toBe("Scene: Lonely");
		});

		it("handles implicit chapters (plain text at root)", () => {
			const input = `Just a Title`;
			const result = parseStructure(input);
			expect(result).toHaveLength(1);
			expect(result[0].type).toBe("chapter");
			expect(result[0].title).toBe("Just a Title");
		});
	});
});
