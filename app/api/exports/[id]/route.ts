import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { deleteExport } from "@/lib/db/queries/book-export";

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();
		const { id: exportId } = await params;

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const deleted = await deleteExport({
			exportId,
			userId: session.user.id,
		});

		if (!deleted) {
			return NextResponse.json({ error: "Export not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Delete export error:", error);
		return NextResponse.json(
			{ error: "Failed to delete export" },
			{ status: 500 },
		);
	}
}
