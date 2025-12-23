import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { ExportList } from "@/app/(chat)/exports/export-list";
import { PageHeader } from "@/components/molecules/page-header";
import { PageContainer } from "@/components/organisms/page-container";
import { getExportsForUser } from "@/lib/db/queries/book-export";

export default async function ExportsPage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/login");
	}

	const exports = await getExportsForUser({ userId: session.user.id });

	return (
		<PageContainer>
			<PageHeader
				title="My Exports"
				description="Download your generated books in PDF and EPUB formats."
				metadata={`${exports.length} export${exports.length !== 1 ? "s" : ""}`}
			/>
			<ExportList exports={exports} />
		</PageContainer>
	);
}
