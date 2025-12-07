"use client";

import { formatDistance, isAfter } from "date-fns";
import { motion } from "framer-motion";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { useWindowSize } from "usehooks-ts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useArtifact } from "@/hooks/use-artifact";
import type { Document } from "@/lib/db/schema";
import { getDocumentTimestampByIndex } from "@/lib/utils";

type VersionFooterProps = {
  handleVersionChange: (type: "next" | "prev" | "toggle" | "latest") => void;
  documents: Document[] | undefined;
  currentVersionIndex: number;
  mode: "edit" | "diff";
};

export const VersionFooter = ({
  handleVersionChange,
  documents,
  currentVersionIndex,
  mode,
}: VersionFooterProps) => {
  const { artifact } = useArtifact();

  const { width } = useWindowSize();
  const isMobile = width < 768;

  const { mutate } = useSWRConfig();
  const [isMutating, setIsMutating] = useState(false);

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
            {currentDocument?.createdAt ? (
              <div className="text-muted-foreground text-sm">
                Saved{" "}
                {formatDistance(
                  new Date(currentDocument.createdAt),
                  new Date(),
                  {
                    addSuffix: true,
                  }
                )}
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
        <Button
          disabled={isMutating}
          onClick={async () => {
            setIsMutating(true);

            mutate(
              `/api/document?id=${artifact.documentId}`,
              await fetch(
                `/api/document?id=${artifact.documentId}&timestamp=${getDocumentTimestampByIndex(
                  documents,
                  currentVersionIndex
                )}`,
                {
                  method: "DELETE",
                }
              ),
              {
                optimisticData: documents
                  ? [
                      ...documents.filter((document) =>
                        isAfter(
                          new Date(document.createdAt),
                          new Date(
                            getDocumentTimestampByIndex(
                              documents,
                              currentVersionIndex
                            )
                          )
                        )
                      ),
                    ]
                  : [],
              }
            );
          }}
        >
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
