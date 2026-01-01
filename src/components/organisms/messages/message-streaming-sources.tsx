"use client";

import { MessageSources } from "@/components/organisms/messages/message-sources";
import type { SourceCitation } from "@/lib/types";

export function MessageStreamingSources({
	sources,
}: { sources?: SourceCitation[] }) {
	if (!sources || sources.length === 0) {
		return null;
	}

	return <MessageSources sources={sources} />;
}
