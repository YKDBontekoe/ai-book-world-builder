"use client";

import { useChat } from "@ai-sdk/react";
import cx from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useWindowSize } from "usehooks-ts";
import {
  DocumentSkeleton,
  InlineDocumentSkeleton,
} from "@/components/document-skeleton";
import { useArtifact } from "@/hooks/use-artifact";
import type { ChatMessage } from "@/lib/types";
import { fetcher } from "@/lib/utils";
import { ArtifactActions } from "./artifact-actions";
import { ArtifactCloseButton } from "./artifact-close-button";
import { ArtifactContent } from "./artifact-content";
import { ArtifactMessages } from "./artifact-messages";
import { artifactDefinitions } from "./definitions";
import { Toolbar } from "./toolbar";
import type { ArtifactKind, UIArtifact } from "./types";
import { VersionFooter } from "./version-footer";

const ArtifactComponent = () => {
  const { artifact, setArtifact } = useArtifact();

  const lastVisibleArtifactRef = useRef<UIArtifact | null>(null);
  if (artifact.isVisible) {
    lastVisibleArtifactRef.current = artifact;
  }
  const lastVisibleArtifact = lastVisibleArtifactRef.current;

  const isArtifactVisible = artifact.isVisible;
  const setIsArtifactVisible = useCallback(
    (visible: boolean) => {
      setArtifact((currentArtifact) => ({
        ...currentArtifact,
        isVisible: visible,
      }));
    },
    [setArtifact]
  );

  const { width: windowWidth } = useWindowSize();
  const { mutate } = useSWRConfig();

  const [isToolbarVisible, setIsToolbarVisible] = useState(false);

  const chatHelpers = useChat({
    id: artifact?.documentId,
    body: {
      id: artifact?.documentId,
      kind: artifact?.kind,
      title: artifact?.title,
    },
    initialMessages: [],
    onFinish: async () => {
      await mutate(
        `/api/document?id=${artifact?.documentId}`,
        fetcher(`/api/document?id=${artifact?.documentId}`)
      );
    },
  } as any) as any;

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    handleInputChange,
    stop,
    append,
    status,
    data,
  } = chatHelpers;

  const { data: document } = useSWR(
    artifact?.documentId ? `/api/document?id=${artifact?.documentId}` : null,
    fetcher
  );

  useEffect(() => {
    if (artifact?.kind) {
      // Logic to handle different kinds of artifacts if needed
    }
  }, [artifact]);

  useEffect(() => {
    if (artifact?.status === "streaming") {
      setIsArtifactVisible(true);
    }
  }, [artifact?.status, setIsArtifactVisible]);

  if (!isArtifactVisible && !lastVisibleArtifact) {
    return null;
  }

  const initialArtifactData: UIArtifact = {
    kind: "text",
    documentId: "",
    title: "Initial Document",
    content: "",
    isVisible: false,
    status: "idle",
    boundingBox: {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    },
  };

  const currentArtifact = isArtifactVisible
    ? artifact
    : lastVisibleArtifact || initialArtifactData;

  const handleVersionChange = (type: "next" | "prev" | "toggle" | "latest") => {
    /* implementation */
  };

  return (
    <motion.div
      animate={{
        x: isArtifactVisible ? 0 : "100%",
        width: windowWidth && windowWidth < 768 ? "100%" : "50%",
      }}
      className={cx(
        "fixed top-0 right-0 z-50 h-dvh bg-background shadow-2xl transition-all duration-300 ease-in-out print:static print:h-auto print:w-full print:shadow-none",
        {
          "border-l": isArtifactVisible,
        }
      )}
      initial={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex h-full flex-col">
        <div className="flex flex-row items-center justify-between border-b p-4">
          <div className="flex flex-row items-center gap-2">
            <ArtifactActions
              artifact={currentArtifact}
              currentVersionIndex={0}
              handleVersionChange={handleVersionChange}
              isCurrentVersion={true}
              metadata={null}
              mode="edit"
              setMetadata={() => {}}
            />
          </div>

          <ArtifactCloseButton />
        </div>

        <ArtifactContent
          artifact={currentArtifact}
          document={document}
          sendMessage={handleSubmit}
        />

        <div className="flex-1 overflow-y-auto">
          {isToolbarVisible && (
            <div className="sticky bottom-4 mx-auto w-full max-w-md px-4">
              <Toolbar
                artifactKind={currentArtifact.kind}
                isToolbarVisible={isToolbarVisible}
                sendMessage={async (message, options) => {
                  if (message) {
                    await append({ role: "user", content: message });
                  }
                }}
                setIsToolbarVisible={setIsToolbarVisible}
                setMessages={setMessages as any}
                status={status}
                stop={async () => {
                  stop();
                }}
              />
            </div>
          )}
        </div>

        <ArtifactMessages
          artifactStatus={artifact?.status}
          chatId={artifact?.documentId}
          isReadonly={false}
          messages={messages}
          regenerate={async () => {}}
          setMessages={setMessages}
          status={status}
          votes={undefined}
        />

        <VersionFooter
          currentVersionIndex={0}
          documents={document ? [document] : undefined}
          handleVersionChange={handleVersionChange}
          mode="edit"
        />
      </div>
    </motion.div>
  );
};

export const Artifact = memo(ArtifactComponent);
