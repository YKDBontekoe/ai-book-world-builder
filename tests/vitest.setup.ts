import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

process.env.NEXT_RUNTIME = process.env.NEXT_RUNTIME ?? "nodejs";

if (typeof window !== "undefined" && typeof document !== "undefined") {
	await import("@testing-library/jest-dom/vitest");

	if (typeof Element !== "undefined") {
		Element.prototype.hasPointerCapture ||= () => false;
		Element.prototype.releasePointerCapture ||= () => {};
	}

	afterEach(() => {
		cleanup();
	});
}
