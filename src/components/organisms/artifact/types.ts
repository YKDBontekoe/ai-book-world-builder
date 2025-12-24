export type ArtifactKind = "text" | "code" | "sheet" | "image";

export type UIArtifact = {
	documentId: string;
	content: string;
	kind: ArtifactKind;
	title: string;
	status: "idle" | "streaming";
	isVisible: boolean;
	boundingBox: {
		top: number;
		left: number;
		width: number;
		height: number;
	};
};
