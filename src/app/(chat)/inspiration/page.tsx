import { BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { AnalyzeBookButton } from "@/app/(chat)/inspiration/analyze-button";
import { Button } from "@/components/atoms/button";
import { FileIcon } from "@/components/atoms/file-icon";
import { GridList } from "@/components/atoms/grid-list";
import { StatusBadge } from "@/components/atoms/status-badge";
import { EmptyState } from "@/components/molecules/empty-state";
import { GlassCard } from "@/components/molecules/glass-card";
import { PageHeader } from "@/components/molecules/page-header";
import { PageContainer } from "@/components/organisms/page-container";
import { getSourceMaterialsForUser } from "@/lib/db/queries/source-material";

export default async function InspirationPage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/login");
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
					variant="glass"
					title="No books uploaded yet"
					description="Upload a PDF, EPUB, DOCX, or TXT file to any project to analyze it for characters, locations, and story elements."
					icon={BookOpen}
					action={
						<Button asChild>
							<Link href="/">Go to Projects</Link>
						</Button>
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
									<GlassCard
										key={material.id}
										variant="liquid"
										className="flex flex-col gap-4 p-6"
									>
										<div className="flex items-start justify-between gap-4">
											<div className="flex items-start gap-4">
												<div className="p-2.5 rounded-xl bg-primary/5 ring-1 ring-primary/10">
													<FileIcon mimeType={material.mimeType} size={24} />
												</div>
												<div>
													<h3 className="font-semibold text-base leading-tight">
														{material.filename}
													</h3>
													<p className="text-muted-foreground text-xs mt-1.5">
														Project: {material.projectName}
													</p>
												</div>
											</div>
											<StatusBadge
												status="success"
												className="bg-green-500/10 text-green-600 shadow-none shrink-0"
											>
												Ready
											</StatusBadge>
										</div>

										<div className="pt-2">
											<AnalyzeBookButton
												sourceMaterialId={material.id}
												projectId={material.projectId}
												filename={material.filename}
											/>
										</div>
									</GlassCard>
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
									<GlassCard
										key={material.id}
										variant="liquid"
										className="flex items-center justify-between p-6 opacity-75"
									>
										<div className="flex items-center gap-4">
											<div className="p-2.5 rounded-xl bg-muted/20">
												<FileIcon
													mimeType={material.mimeType}
													className="opacity-50"
													size={24}
												/>
											</div>
											<div>
												<h3 className="font-semibold text-base">
													{material.filename}
												</h3>
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
										</div>
									</GlassCard>
								))}
							</GridList>
						</section>
					)}
				</div>
			)}
		</PageContainer>
	);
}
