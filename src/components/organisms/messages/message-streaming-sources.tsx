"use client";

import { useDataStream } from "@/components/organisms/chat/data-stream-provider";
import { MessageSources } from "@/components/organisms/messages/message-sources";
import type { SourceCitation } from "@/lib/types";

export function MessageStreamingSources() {
	const { dataStream } = useDataStream();

	// Extract sources from data stream
	const sources = dataStream
		.filter((item) => item.type === "data-sources")
		.flatMap((item) => item.data as SourceCitation[]);

	if (!sources || sources.length === 0) {
		return null;
	}

	return <MessageSources sources={sources} />;
}
