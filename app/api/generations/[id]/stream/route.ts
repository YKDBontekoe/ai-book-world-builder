import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/queries";
import { bookGeneration, bookGenerationStep } from "@/lib/db/schema";

/**
 * SSE Stream for real-time generation progress updates
 * Sends events: step_start, step_complete, progress, log, error, complete
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth();
	if (!session?.user?.id) {
		return new Response("Unauthorized", { status: 401 });
	}

	const { id: generationId } = await params;

	// Verify the generation exists
	const [generation] = await db
		.select()
		.from(bookGeneration)
		.where(eq(bookGeneration.id, generationId));

	if (!generation) {
		return new Response("Generation not found", { status: 404 });
	}

	// Create a readable stream for SSE
	const encoder = new TextEncoder();
	let intervalId: ReturnType<typeof setInterval> | null = null;
	let isActive = true;

	const stream = new ReadableStream({
		async start(controller) {
			// Send initial state
			const sendEvent = (event: string, data: any) => {
				if (!isActive) return;
				try {
					controller.enqueue(
						encoder.encode(
							`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
						),
					);
				} catch (e) {
					// Stream closed
					isActive = false;
				}
			};

			// Send initial generation state
			sendEvent("init", {
				generationId,
				status: generation.status,
				completedSteps: generation.completedSteps || 0,
				totalSteps: generation.totalSteps || 0,
			});

			// Poll for updates every second
			intervalId = setInterval(async () => {
				if (!isActive) {
					if (intervalId) clearInterval(intervalId);
					return;
				}

				try {
					// Fetch latest generation state
					const [currentGen] = await db
						.select()
						.from(bookGeneration)
						.where(eq(bookGeneration.id, generationId));

					if (!currentGen) {
						sendEvent("error", { message: "Generation not found" });
						isActive = false;
						controller.close();
						return;
					}

					// Fetch steps
					const steps = await db
						.select()
						.from(bookGenerationStep)
						.where(eq(bookGenerationStep.generationId, generationId));

					const completedSteps = steps.filter(
						(s) => s.status === "completed",
					).length;
					const runningStep = steps.find((s) => s.status === "running");

					// Send progress update
					sendEvent("progress", {
						status: currentGen.status,
						completedSteps,
						totalSteps: steps.length,
						currentStep: runningStep
							? {
									id: runningStep.id,
									type: runningStep.stepType,
									chapterId: runningStep.chapterId,
									sequence: runningStep.sequence,
								}
							: null,
					});

					// If completed or failed, close the stream
					if (currentGen.status === "completed") {
						sendEvent("complete", {
							message: "Generation completed successfully",
							completedSteps,
							totalSteps: steps.length,
						});
						isActive = false;
						if (intervalId) clearInterval(intervalId);
						controller.close();
					} else if (currentGen.status === "failed") {
						sendEvent("error", {
							message: currentGen.error || "Generation failed",
						});
						isActive = false;
						if (intervalId) clearInterval(intervalId);
						controller.close();
					}
				} catch (error) {
					console.error("SSE polling error:", error);
					sendEvent("error", { message: "Internal error" });
				}
			}, 1000);
		},

		cancel() {
			isActive = false;
			if (intervalId) clearInterval(intervalId);
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache, no-transform",
			Connection: "keep-alive",
			"X-Accel-Buffering": "no", // For nginx
		},
	});
}
