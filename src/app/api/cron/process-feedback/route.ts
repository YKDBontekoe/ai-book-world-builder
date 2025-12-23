import { processDailyFeedback } from "@/lib/services/feedback-service";
import { NextResponse } from "next/server";

export const maxDuration = 300; // 5 minutes

export async function GET(request: Request) {
  // Minimal auth check if CRON_SECRET is set
  if (process.env.CRON_SECRET) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
          return new Response('Unauthorized', { status: 401 });
      }
  }

  try {
    const result = await processDailyFeedback();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json({ error: "Failed to process feedback" }, { status: 500 });
  }
}
