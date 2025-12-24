"use client";

import type { DataUIPart } from "ai";
import { useEffect } from "react";
import { artifactDefinitions } from "@/components/organisms/artifact/definitions";
import { useDataStream } from "@/components/organisms/chat/data-stream-provider";
import { initialArtifactData, useArtifact } from "@/hooks/use-artifact";
import type { CustomUIDataTypes } from "@/lib/types";

export function DataStreamHandler() {
	const { dataStream, setDataStream } = useDataStream();

	const { artifact, setArtifact, setMetadata } = useArtifact();

	useEffect(() => {
		if (!dataStream?.length) {
			return;
		}

		const newDeltas = dataStream.slice();
		setDataStream([]);

		for (const delta of newDeltas) {
			if (delta.type === "tool-log" || delta.type === "append-message") {
				continue;
			}

			// Safe cast as we filtered out custom parts
			const dataPart = delta as DataUIPart<CustomUIDataTypes>;

			const artifactDefinition = artifactDefinitions.find(
				(currentArtifactDefinition) =>
					currentArtifactDefinition.kind === artifact.kind,
			);

			if (artifactDefinition?.onStreamPart) {
				artifactDefinition.onStreamPart({
					streamPart: dataPart,
					setArtifact,
					setMetadata,
				});
			}

			setArtifact((draftArtifact) => {
				if (!draftArtifact) {
					return { ...initialArtifactData, status: "streaming" };
				}

				switch (dataPart.type) {
					case "data-id":
						return {
							...draftArtifact,
							documentId: dataPart.data,
							status: "streaming",
						};

					case "data-title":
						return {
							...draftArtifact,
							title: dataPart.data,
							status: "streaming",
						};

					case "data-kind":
						return {
							...draftArtifact,
							kind: dataPart.data,
							status: "streaming",
						};

					case "data-clear":
						return {
							...draftArtifact,
							content: "",
							status: "streaming",
						};

					case "data-finish":
						return {
							...draftArtifact,
							status: "idle",
						};

					default:
						return draftArtifact;
				}
			});
		}
	}, [dataStream, setArtifact, setMetadata, artifact, setDataStream]);

	return null;
}
