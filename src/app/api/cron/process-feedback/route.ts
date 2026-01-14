import { timingSafeEqual } from "crypto";
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
		const encoder = new TextEncoder();
		const a = encoder.encode(authHeader);
		const b = encoder.encode(expectedHeader);

		// timingSafeEqual requires same length
		if (a.length === b.length) {
			isValid = timingSafeEqual(a, b);
		}
	} catch (e) {
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
