import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/queries";
import { generationTemplate } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { name, description, settings } = body;

		if (!name || !settings) {
			return NextResponse.json(
				{ error: "Name and settings required" },
				{ status: 400 },
			);
		}

		const [template] = await db
			.insert(generationTemplate)
			.values({
				name,
				description,
				settings,
				isBuiltIn: false,
				userId: session.user.id,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		return NextResponse.json(template);
	} catch (error) {
		console.error("Failed to create template:", error);
		return NextResponse.json(
			{ error: "Failed to create template" },
			{ status: 500 },
		);
	}
}
