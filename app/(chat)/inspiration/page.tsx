import { BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FileIcon } from "@/components/ui/file-icon";
import { GridList } from "@/components/ui/grid-list";
import { StatusBadge } from "@/components/ui/status-badge";
import { getSourceMaterialsForUser } from "@/lib/db/queries/source-material";
import { AnalyzeBookButton } from "./analyze-button";

export default async function InspirationPage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/api/auth/guest");
	}

	const materials = await getSourceMaterialsForUser({
		userId: session.user.id,
	});

	const processedMaterials = materials.filter((m) => m.status === "processed");
	const pendingMaterials = materials.filter(
		(m) => m.status !== "processed" && m.status !== "failed",
	);

	return (
		<PageContainer>
			<PageHeader
				title="Book Inspiration"
				description="Analyze uploaded books to extract characters, locations, and world-building for your stories."
				metadata={`${processedMaterials.length} ready for analysis`}
			/>

			{materials.length === 0 ? (
				<EmptyState
					title="No books uploaded yet"
					description="Upload a PDF, EPUB, DOCX, or TXT file to any project to analyze it for characters, locations, and story elements."
					icon={BookOpen}
					action={
						<Link href="/" className="text-primary hover:underline text-sm">
							Go to Projects →
						</Link>
					}
				/>
			) : (
				<div className="space-y-8">
					{/* Ready for Analysis */}
					{processedMaterials.length > 0 && (
						<section className="space-y-4">
							<h2 className="text-lg font-semibold flex items-center gap-2">
								<Sparkles className="size-5 text-amber-500" />
								Ready for Analysis
							</h2>
							<GridList columns={{ md: 2 }}>
								{processedMaterials.map((material) => (
									<Card
										key={material.id}
										className="relative overflow-hidden glass-surface border-border/50"
									>
										<div className="absolute inset-0 pointer-events-none" />
										<CardHeader className="flex flex-row items-start justify-between gap-4">
											<div className="flex items-start gap-3">
												<FileIcon mimeType={material.mimeType} size={32} />
												<div>
													<CardTitle className="text-base">
														{material.filename}
													</CardTitle>
													<p className="text-muted-foreground text-xs mt-1">
														Project: {material.projectName}
													</p>
													<div className="flex items-center gap-2 mt-2">
														<StatusBadge
															status="success"
															className="bg-green-500/10 text-green-600"
														>
															Ready
														</StatusBadge>
													</div>
												</div>
											</div>
										</CardHeader>
										<CardContent>
											<AnalyzeBookButton
												sourceMaterialId={material.id}
												projectId={material.projectId}
												filename={material.filename}
											/>
										</CardContent>
									</Card>
								))}
							</GridList>
						</section>
					)}

					{/* Processing */}
					{pendingMaterials.length > 0 && (
						<section className="space-y-4">
							<h2 className="text-lg font-semibold text-muted-foreground">
								Processing...
							</h2>
							<GridList columns={{ md: 2 }}>
								{pendingMaterials.map((material) => (
									<Card
										key={material.id}
										className="opacity-60 glass-surface border-border/40"
									>
										<CardHeader className="flex flex-row items-center gap-4">
											<FileIcon
												mimeType={material.mimeType}
												className="opacity-50"
												size={32}
											/>
											<div>
												<CardTitle className="text-base">
													{material.filename}
												</CardTitle>
												<div className="flex items-center gap-2 mt-1">
													<StatusBadge
														status={
															material.status === "processing"
																? "running"
																: "pending"
														}
													>
														{material.status === "processing"
															? "Processing..."
															: "Pending"}
													</StatusBadge>
												</div>
											</div>
										</CardHeader>
									</Card>
								))}
							</GridList>
						</section>
					)}
				</div>
			)}
		</PageContainer>
	);
}
