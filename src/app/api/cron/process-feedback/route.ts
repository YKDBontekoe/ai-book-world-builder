import { NextResponse } from "next/server";
import { processDailyFeedback } from "@/lib/services/feedback-service";

export const maxDuration = 300; // 5 minutes

export async function GET(request: Request) {
	// Secure Auth Check: Fail Close
	const cronSecret = process.env.CRON_SECRET;
	if (!cronSecret) {
		return new Response("Internal Server Error: CRON_SECRET not configured", {
			status: 500,
		});
	}

	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${cronSecret}`) {
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
