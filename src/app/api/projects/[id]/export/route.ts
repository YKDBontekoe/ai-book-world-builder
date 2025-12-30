import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getFullProjectDataForGeneration } from "@/lib/book-generation";
import { db } from "@/lib/db/queries";
import { bookExport } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";
import { exportBook } from "@/lib/services/book-exporter";
import type { ExportFormat } from "@/lib/services/export/types";

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();
		const { id: projectId } = await params;

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { format } = (await request.json()) as { format: ExportFormat };

		if (!format || !["pdf", "epub"].includes(format)) {
			return NextResponse.json(
				{ error: "Invalid format. Must be 'pdf' or 'epub'." },
				{ status: 400 },
			);
		}

		// Get project data
		const projectData = await getFullProjectDataForGeneration({
			projectId,
			userId: session.user.id,
		});

		if (!projectData) {
			return NextResponse.json({ error: "Project not found" }, { status: 404 });
		}

		// Create pending export record
		const [exportRecord] = await db
			.insert(bookExport)
			.values({
				projectId,
				format,
				status: "pending",
				userId: session.user.id,
				createdAt: new Date(),
			})
			.returning();

		try {
			// Generate and upload
			const result = await exportBook(projectData, format);

			// Update export record with URL
			await db
				.update(bookExport)
				.set({
					blobUrl: result.url,
					status: "completed",
				})
				.where(eq(bookExport.id, exportRecord.id));

			return NextResponse.json({
				success: true,
				exportId: exportRecord.id,
				url: result.url,
				filename: result.filename,
			});
		} catch (exportError) {
			// Update export record with error
			await db
				.update(bookExport)
				.set({
					status: "failed",
					error:
						exportError instanceof Error
							? exportError.message
							: "Unknown error",
				})
				.where(eq(bookExport.id, exportRecord.id));

			throw exportError;
		}
	} catch (error) {
		console.error("Book export error:", error);

		if (error instanceof ChatSDKError) {
			return NextResponse.json(
				{ error: error.message },
				{ status: error.statusCode },
			);
		}

		return NextResponse.json(
			{ error: "Failed to export book" },
			{ status: 500 },
		);
	}
}

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();
		const { id: projectId } = await params;

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get all exports for this project
		const exports = await db
			.select()
			.from(bookExport)
			.where(
				and(
					eq(bookExport.projectId, projectId),
					eq(bookExport.userId, session.user.id),
				),
			)
			.orderBy(bookExport.createdAt);

		return NextResponse.json({ exports });
	} catch (error) {
		console.error("Get exports error:", error);
		return NextResponse.json(
			{ error: "Failed to get exports" },
			{ status: 500 },
		);
	}
}
