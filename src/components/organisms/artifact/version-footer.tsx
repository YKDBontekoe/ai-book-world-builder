"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistance, isAfter } from "date-fns";
import { motion } from "framer-motion";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useWindowSize } from "usehooks-ts";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { useArtifact } from "@/hooks/use-artifact";
import { api } from "@/lib/api-client";
import type { Document } from "@/lib/db/schema";
import { QUERY_KEYS } from "@/lib/query-options";

type VersionFooterProps = {
	handleVersionChange: (type: "next" | "prev" | "toggle" | "latest") => void;
	documents: Document[] | undefined;
	currentVersionIndex: number;
	mode: "edit" | "diff";
};

function getDocumentTimestampByIndex(documents: Document[], index: number) {
	if (!documents || documents.length === 0) {
		return new Date();
	}
	if (index >= documents.length) {
		return new Date();
	}

	return documents[index].createdAt;
}

export const VersionFooter = ({
	handleVersionChange,
	documents,
	currentVersionIndex,
	mode,
}: VersionFooterProps) => {
	const { artifact } = useArtifact();
	const queryClient = useQueryClient();

	const { width } = useWindowSize();
	const isMobile = width < 768;
	const [timeString, setTimeString] = useState<string>("");

	// Fix hydration mismatch by calculating relative time only on client
	useEffect(() => {
		if (documents?.[currentVersionIndex]?.createdAt) {
			setTimeString(
				formatDistance(
					new Date(documents[currentVersionIndex].createdAt),
					new Date(),
					{
						addSuffix: true,
					},
				),
			);
		}
	}, [documents, currentVersionIndex]);

	const { mutate: restoreVersion, isPending: isMutating } = useMutation({
		mutationFn: async () => {
			if (!artifact.documentId) return;
			const timestamp = getDocumentTimestampByIndex(
				documents ?? [],
				currentVersionIndex,
			);

			return api.delete(`/api/document`, {
				params: {
					id: artifact.documentId,
					timestamp: timestamp.toISOString(),
				},
			});
		},
		onMutate: async () => {
			if (!artifact.documentId || !documents) return;

			await queryClient.cancelQueries({
				queryKey: QUERY_KEYS.document(artifact.documentId),
			});

			const previousDocuments = queryClient.getQueryData<Document[]>(
				QUERY_KEYS.document(artifact.documentId),
			);

			queryClient.setQueryData<Document[]>(
				QUERY_KEYS.document(artifact.documentId),
				(old) => {
					if (!old) return [];
					const targetDate = getDocumentTimestampByIndex(
						documents,
						currentVersionIndex,
					);
					// Filter out documents created after the target date (effectively restoring state)
					return old.filter(
						(doc) => !isAfter(new Date(doc.createdAt), targetDate),
					);
				},
			);

			return { previousDocuments };
		},
		onError: (_, __, context) => {
			if (context?.previousDocuments && artifact.documentId) {
				queryClient.setQueryData(
					QUERY_KEYS.document(artifact.documentId),
					context.previousDocuments,
				);
			}
		},
		onSuccess: () => {
			if (artifact.documentId) {
				queryClient.invalidateQueries({
					queryKey: QUERY_KEYS.document(artifact.documentId),
				});
			}
		},
	});

	if (!documents) {
		return null;
	}

	const currentDocument = documents[currentVersionIndex];
	const draftLabel = `Draft ${currentVersionIndex + 1} of ${documents.length}`;

	return (
		<motion.div
			animate={{ y: 0 }}
			className="absolute bottom-0 z-50 flex w-full flex-col justify-between gap-4 border-t bg-background p-4 lg:flex-row"
			exit={{ y: isMobile ? 200 : 77 }}
			initial={{ y: isMobile ? 200 : 77 }}
			transition={{ type: "spring", stiffness: 140, damping: 20 }}
		>
			<div>
				<div className="flex flex-col gap-1">
					<div className="flex flex-row flex-wrap items-center gap-2">
						<Badge variant="outline">{draftLabel}</Badge>
						{currentDocument?.createdAt && timeString ? (
							<div className="text-muted-foreground text-sm">
								Saved {timeString}
							</div>
						) : null}
					</div>
					<div className="text-muted-foreground text-sm">
						You are viewing a previous version. Restore to keep editing.
					</div>
				</div>
			</div>

			<div className="flex flex-row gap-4">
				<Button
					onClick={() => {
						handleVersionChange("toggle");
					}}
					variant="outline"
				>
					{mode === "diff" ? "Exit diff" : "View diff"}
				</Button>
				<Button disabled={isMutating} onClick={() => restoreVersion()}>
					<div>Restore this version</div>
					{isMutating && (
						<div className="animate-spin">
							<Loader2Icon size={16} />
						</div>
					)}
				</Button>
				<Button
					onClick={() => {
						handleVersionChange("latest");
					}}
					variant="outline"
				>
					Back to latest version
				</Button>
			</div>
		</motion.div>
	);
};
