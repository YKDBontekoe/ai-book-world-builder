import { BookOpen, Download, FileText } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getExportsForUser } from "@/lib/db/queries/book-export";
import { DeleteExportButton } from "./delete-export-button";

export default async function ExportsPage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/api/auth/guest");
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
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<BookOpen className="size-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium mb-2">No exports yet</h3>
						<p className="text-muted-foreground text-sm text-center mb-4">
							Export your books from the project page to see them here.
						</p>
						<Button asChild>
							<Link href="/">Go to Projects</Link>
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4">
					{exports.map((exportItem) => (
						<Card key={exportItem.id}>
							<CardHeader className="flex flex-row items-center justify-between gap-4">
								<div className="flex items-center gap-4">
									{exportItem.format === "pdf" ? (
										<FileText className="size-8 text-red-500" />
									) : (
										<BookOpen className="size-8 text-blue-500" />
									)}
									<div>
										<CardTitle className="text-base">
											{exportItem.projectName}
										</CardTitle>
										<div className="flex items-center gap-2 mt-1">
											<Badge variant="outline">
												{exportItem.format.toUpperCase()}
											</Badge>
											<span className="text-muted-foreground text-xs">
												{new Date(exportItem.createdAt).toLocaleDateString()} at{" "}
												{new Date(exportItem.createdAt).toLocaleTimeString()}
											</span>
											{exportItem.status === "pending" && (
												<Badge variant="secondary">Processing</Badge>
											)}
											{exportItem.status === "failed" && (
												<Badge variant="destructive">Failed</Badge>
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
							</CardHeader>
							{exportItem.error && (
								<CardContent>
									<p className="text-destructive text-sm">{exportItem.error}</p>
								</CardContent>
							)}
						</Card>
					))}
				</div>
			)}
		</PageContainer>
	);
}
