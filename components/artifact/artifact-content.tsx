import { memo } from "react";
import { DocumentSkeleton } from "@/components/document-skeleton";
import type { Document } from "@/lib/db/schema"; // Assuming Document type location
import type { UIArtifact } from "./types";

const PureArtifactContent = ({
  artifact,
  document,
  sendMessage,
}: {
  artifact: UIArtifact;
  document?: Document;
  sendMessage: (message: string) => void;
}) => {
  return (
    <div className="relative flex-1 overflow-hidden">
      {document ? (
        <div className="h-full overflow-y-auto p-4">
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {document.content}
          </pre>
        </div>
      ) : (
        <div className="p-4">
          <DocumentSkeleton artifactKind={artifact.kind} />
        </div>
      )}
    </div>
  );
};

export const ArtifactContent = memo(PureArtifactContent);
