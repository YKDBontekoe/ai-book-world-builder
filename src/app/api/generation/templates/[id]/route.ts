import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/queries";
import { generationTemplate } from "@/lib/db/schema";

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;

	try {
		// Only allow deleting user's own templates
		await db
			.delete(generationTemplate)
			.where(
				and(
					eq(generationTemplate.id, id),
					eq(generationTemplate.userId, session.user.id),
					eq(generationTemplate.isBuiltIn, false),
				),
			);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Failed to delete template:", error);
		return NextResponse.json(
			{ error: "Failed to delete template" },
			{ status: 500 },
		);
	}
}
