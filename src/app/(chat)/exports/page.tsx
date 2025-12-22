import { BookOpen, Download, FileText } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { PageContainer } from "@/components/organisms/page-container";
import { PageHeader } from "@/components/molecules/page-header";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { GlassCard } from "@/components/molecules/glass-card";
import { getExportsForUser } from "@/lib/db/queries/book-export";
import { DeleteExportButton } from "@/app/(chat)/exports/delete-export-button";

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

			{exports.length === 0 ? (
				<EmptyState
					variant="glass"
					title="No exports yet"
					description="Export your books from the project page to see them here."
					icon={BookOpen}
					action={
						<Button asChild>
							<Link href="/projects">Go to Projects</Link>
						</Button>
					}
				/>
			) : (
				<div className="grid gap-4">
					{exports.map((exportItem) => (
						<GlassCard key={exportItem.id} variant="liquid" className="p-6">
							<div className="flex flex-row items-center justify-between gap-4">
								<div className="flex items-center gap-4">
									{exportItem.format === "pdf" ? (
										<div className="p-2 rounded-lg bg-red-500/10 text-red-500">
											<FileText className="size-6" />
										</div>
									) : (
										<div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
											<BookOpen className="size-6" />
										</div>
									)}
									<div>
										<h3 className="font-semibold text-base">
											{exportItem.projectName}
										</h3>
										<div className="flex items-center gap-2 mt-1">
											<Badge
												variant="outline"
												className="text-[10px] h-5 px-1.5 uppercase"
											>
												{exportItem.format}
											</Badge>
											<span className="text-muted-foreground text-xs">
												{new Date(exportItem.createdAt).toLocaleDateString()}
											</span>
											{exportItem.status === "pending" && (
												<Badge variant="secondary" className="text-[10px] h-5">
													Processing
												</Badge>
											)}
											{exportItem.status === "failed" && (
												<Badge variant="destructive" className="text-[10px] h-5">
													Failed
												</Badge>
											)}
										</div>
									</div>
								</div>
								<div className="flex items-center gap-2">
									{exportItem.status === "completed" && exportItem.blobUrl && (
										<Button asChild size="sm" variant="outline">
											<a
												href={exportItem.blobUrl}
												download
												target="_blank"
												rel="noopener noreferrer"
											>
												<Download className="mr-2 size-4" />
												Download
											</a>
										</Button>
									)}
									<DeleteExportButton exportId={exportItem.id} />
								</div>
							</div>
							{exportItem.error && (
								<div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
									{exportItem.error}
								</div>
							)}
						</GlassCard>
					))}
				</div>
			)}
		</PageContainer>
	);
}
