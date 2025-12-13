"use client";

import { EntityProposal } from "../../chat/widgets/entity-proposal";
import type { ToolMessagePart, ToolRendererProps } from "./types";

export const ProposeManageEntitiesRenderer = ({ part }: ToolRendererProps) => {
	const toolPart = part as unknown as ToolMessagePart;
	const { toolCallId } = toolPart;
	const output = toolPart.output;

	if (!output?.proposal) return null;

	return (
		<div className="relative" key={toolCallId}>
			<EntityProposal
				projectId={output.proposal.projectId}
				operations={output.proposal.operations}
			/>
		</div>
	);
};
