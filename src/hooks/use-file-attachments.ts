"use client";

import { type ChangeEvent, useCallback, useState } from "react";
import { toast } from "sonner";

import type { Attachment } from "@/lib/types";

interface UseFileAttachmentsProps {
	projectId?: string | null;
}

export function useFileAttachments({ projectId }: UseFileAttachmentsProps) {
	const [attachments, setAttachments] = useState<Attachment[]>([]);
	const [uploadQueue, setUploadQueue] = useState<string[]>([]);

	const uploadFile = useCallback(
		async (file: File) => {
			if (!projectId) {
				toast.error("Select a project before uploading files.");
				return;
			}

			const formData = new FormData();
			formData.append("file", file);
			formData.append("projectId", projectId);

			try {
				const response = await fetch("/api/files/upload", {
					method: "POST",
					body: formData,
				});

				const payload = await response.json();

				if (response.ok && payload.status === "uploaded") {
					const material = payload.material;
					const contentType = material?.mimeType ?? payload.blob?.contentType;
					const url = material?.blobUrl ?? payload.blob?.url;

					if (material && url) {
						return {
							url,
							name: material.filename,
							contentType: contentType ?? file.type,
						};
					}
				}

				const errorMessage = payload.message ?? "Failed to upload file.";
				toast.error(errorMessage);
			} catch (_error) {
				toast.error("Failed to upload file, please try again!");
			}
		},
		[projectId],
	);

	const handleFileChange = useCallback(
		async (event: ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(event.target.files || []);

			setUploadQueue(files.map((file) => file.name));

			try {
				const uploadPromises = files.map((file) => uploadFile(file));
				const uploadedAttachments = await Promise.all(uploadPromises);
				const successfullyUploadedAttachments = uploadedAttachments.filter(
					(attachment): attachment is Attachment => attachment !== undefined,
				);

				setAttachments((currentAttachments) => [
					...currentAttachments,
					...successfullyUploadedAttachments,
				]);
			} catch (error) {
				console.error("Error uploading files!", error);
			} finally {
				setUploadQueue([]);
			}
		},
		[uploadFile],
	);

	const handlePaste = useCallback(
		async (event: ClipboardEvent) => {
			const items = event.clipboardData?.items;
			if (!items) {
				return;
			}

			const imageItems = Array.from(items).filter((item) =>
				item.type.startsWith("image/"),
			);

			if (imageItems.length === 0) {
				return;
			}

			// Prevent default paste behavior for images
			event.preventDefault();

			setUploadQueue((prev) => [...prev, "Pasted image"]);

			try {
				const uploadPromises = imageItems
					.map((item) => item.getAsFile())
					.filter((file): file is File => file !== null)
					.map((file) => uploadFile(file));

				const uploadedAttachments = await Promise.all(uploadPromises);
				const successfullyUploadedAttachments = uploadedAttachments.filter(
					(attachment): attachment is Attachment =>
						attachment !== undefined &&
						attachment.url !== undefined &&
						attachment.contentType !== undefined,
				);

				setAttachments((curr) => [...curr, ...successfullyUploadedAttachments]);
			} catch (error) {
				console.error("Error uploading pasted images:", error);
				toast.error("Failed to upload pasted image(s)");
			} finally {
				setUploadQueue([]);
			}
		},
		[uploadFile],
	);

	return {
		attachments,
		setAttachments,
		uploadQueue,
		handleFileChange,
		handlePaste,
	};
}
