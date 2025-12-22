"use client";

import { PreviewAttachment } from "@/components/organisms/chat/preview-attachment";
import type { Attachment } from "@/lib/types";

interface AttachmentPreviewListProps {
	attachments: Attachment[];
	uploadQueue: string[];
	onRemoveAttachment: (url: string) => void;
}

export function AttachmentPreviewList({
	attachments,
	uploadQueue,
	onRemoveAttachment,
}: AttachmentPreviewListProps) {
	if (attachments.length === 0 && uploadQueue.length === 0) {
		return null;
	}

	return (
		<div
			className="flex flex-row items-end gap-2 overflow-x-scroll"
			data-testid="attachments-preview"
		>
			{attachments.map((attachment) => (
				<PreviewAttachment
					attachment={attachment}
					key={attachment.url}
					onRemove={() => onRemoveAttachment(attachment.url)}
				/>
			))}

			{uploadQueue.map((filename) => (
				<PreviewAttachment
					attachment={{
						url: "",
						name: filename,
						contentType: "",
					}}
					isUploading={true}
					key={filename}
				/>
			))}
		</div>
	);
}
