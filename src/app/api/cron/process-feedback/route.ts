import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { processDailyFeedback } from "@/lib/services/feedback-service";

export const maxDuration = 300; // 5 minutes

export async function GET(request: Request) {
	const cronSecret = process.env.CRON_SECRET;

	// Fail closed if secret is not configured
	if (!cronSecret) {
		console.error("Security: CRON_SECRET is not configured");
		return new Response("Internal Server Error", { status: 500 });
	}

	const authHeader = request.headers.get("authorization") || "";
	const expectedHeader = `Bearer ${cronSecret}`;

	// Constant-time comparison
	let isValid = false;
	try {
		// We hash both values to ensure they are the same length (32 bytes for sha256)
		// This prevents length leakage via the length check required by timingSafeEqual
		const hashA = createHash("sha256").update(authHeader).digest();
		const hashB = createHash("sha256").update(expectedHeader).digest();

		isValid = timingSafeEqual(hashA, hashB);
	} catch (_e) {
		isValid = false;
	}

	if (!isValid) {
		return new Response("Unauthorized", { status: 401 });
	}

	try {
		const result = await processDailyFeedback();
		return NextResponse.json(result);
	} catch (error) {
		console.error("Cron job failed:", error);
		return NextResponse.json(
			{ error: "Failed to process feedback" },
			{ status: 500 },
		);
	}
}
