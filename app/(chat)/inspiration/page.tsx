import { BookOpen, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<BookOpen className="size-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium mb-2">No books uploaded yet</h3>
						<p className="text-muted-foreground text-sm text-center mb-4 max-w-md">
							Upload a PDF, EPUB, DOCX, or TXT file to any project to analyze it
							for characters, locations, and story elements.
						</p>
						<Link href="/" className="text-primary hover:underline text-sm">
							Go to Projects →
						</Link>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-6">
					{/* Ready for Analysis */}
					{processedMaterials.length > 0 && (
						<section>
							<h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
								<Sparkles className="size-5 text-amber-500" />
								Ready for Analysis
							</h2>
							<div className="grid gap-4 md:grid-cols-2">
								{processedMaterials.map((material) => (
									<Card key={material.id} className="relative overflow-hidden">
										<div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
										<CardHeader className="flex flex-row items-start justify-between gap-4">
											<div className="flex items-start gap-3">
												{getMaterialIcon(material.mimeType)}
												<div>
													<CardTitle className="text-base">
														{material.filename}
													</CardTitle>
													<p className="text-muted-foreground text-xs mt-1">
														Project: {material.projectName}
													</p>
													<div className="flex items-center gap-2 mt-2">
														<Badge variant="outline" className="text-xs">
															{getFileType(material.mimeType)}
														</Badge>
														<Badge
															variant="secondary"
															className="text-xs bg-green-500/10 text-green-600"
														>
															Ready
														</Badge>
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
							</div>
						</section>
					)}

					{/* Processing */}
					{pendingMaterials.length > 0 && (
						<section>
							<h2 className="text-lg font-semibold mb-3 text-muted-foreground">
								Processing...
							</h2>
							<div className="grid gap-4 md:grid-cols-2">
								{pendingMaterials.map((material) => (
									<Card key={material.id} className="opacity-60">
										<CardHeader className="flex flex-row items-center gap-4">
											{getMaterialIcon(material.mimeType)}
											<div>
												<CardTitle className="text-base">
													{material.filename}
												</CardTitle>
												<div className="flex items-center gap-2 mt-1">
													<Badge variant="outline" className="text-xs">
														{getFileType(material.mimeType)}
													</Badge>
													<Badge variant="secondary" className="text-xs">
														{material.status === "processing"
															? "Processing..."
															: "Pending"}
													</Badge>
												</div>
											</div>
										</CardHeader>
									</Card>
								))}
							</div>
						</section>
					)}
				</div>
			)}
		</PageContainer>
	);
}

function getMaterialIcon(mimeType: string) {
	if (mimeType === "application/pdf") {
		return <FileText className="size-8 text-red-500 shrink-0" />;
	}
	if (mimeType === "application/epub+zip") {
		return <BookOpen className="size-8 text-blue-500 shrink-0" />;
	}
	return <FileText className="size-8 text-muted-foreground shrink-0" />;
}

function getFileType(mimeType: string): string {
	const types: Record<string, string> = {
		"application/pdf": "PDF",
		"application/epub+zip": "EPUB",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document":
			"DOCX",
		"text/plain": "TXT",
	};
	return types[mimeType] ?? "File";
}
