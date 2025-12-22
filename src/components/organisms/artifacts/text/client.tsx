import {
  CopyIcon,
  MessageSquareIcon,
  PenIcon,
  RedoIcon,
  RotateCcwIcon,
  UndoIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Artifact } from "@/components/organisms/artifact/create-artifact";
import { DiffView } from "@/components/organisms/editor/diffview";
import { DocumentSkeleton } from "@/components/organisms/document/document-skeleton";
import { Editor } from "@/components/organisms/editor/text-editor";
import { Button } from "@/components/atoms/button";
import type { Suggestion } from "@/lib/db/schema";
import { buildRewritePrompt, type RewriteIntent } from "@/lib/editor/rewrite";
import { getSuggestions } from "@/components/organisms/artifacts/actions";

type TextArtifactMetadata = {
  suggestions: Suggestion[];
};

export const textArtifact = new Artifact<"text", TextArtifactMetadata>({
  kind: "text",
  description: "Useful for text content, like drafting essays and emails.",
  initialize: async ({ documentId, setMetadata }) => {
    const suggestions = await getSuggestions({ documentId });

    setMetadata({
      suggestions,
    });
  },
  onStreamPart: ({ streamPart, setMetadata, setArtifact }) => {
    if (streamPart.type === "data-suggestion") {
      setMetadata((metadata) => {
        return {
          suggestions: [...metadata.suggestions, streamPart.data],
        };
      });
    }

    if (streamPart.type === "data-textDelta") {
      setArtifact((draftArtifact) => {
        return {
          ...draftArtifact,
          content: draftArtifact.content + streamPart.data,
          isVisible:
            draftArtifact.status === "streaming" &&
            draftArtifact.content.length > 400 &&
            draftArtifact.content.length < 450
              ? true
              : draftArtifact.isVisible,
          status: "streaming",
        };
      });
    }
  },
  content: ({
    mode,
    status,
    content,
    isCurrentVersion,
    currentVersionIndex,
    onSaveContent,
    getDocumentContentById,
    isLoading,
    metadata,
    sendMessage,
  }) => {
    const [selectedText, setSelectedText] = useState<string>("");
    const [lastPrompt, setLastPrompt] = useState<string>("");
    const canRewriteSelection = isCurrentVersion && status === "idle";

    useEffect(() => {
      if (!canRewriteSelection) {
        setSelectedText("");
      }
    }, [canRewriteSelection]);

    if (isLoading) {
      return <DocumentSkeleton artifactKind="text" />;
    }

    if (mode === "diff") {
      const oldContent = getDocumentContentById(currentVersionIndex - 1);
      const newContent = getDocumentContentById(currentVersionIndex);

      return <DiffView newContent={newContent} oldContent={oldContent} />;
    }

    return (
      <div className="flex flex-col gap-4 px-4 py-8 md:p-20">
        {canRewriteSelection && selectedText ? (
          <SelectionRewritePrompt
            lastPrompt={lastPrompt}
            onClearSelection={() => {
              setSelectedText("");
            }}
            onPrompt={(intent) => {
              const prompt = buildRewritePrompt({
                selection: selectedText,
                intent,
              });

              setLastPrompt(prompt);

              sendMessage({
                role: "user",
                parts: [
                  {
                    type: "text",
                    text: prompt,
                  },
                ],
              });
            }}
            selection={selectedText}
          />
        ) : null}

        <Editor
          content={content}
          currentVersionIndex={currentVersionIndex}
          isCurrentVersion={isCurrentVersion}
          onSaveContent={onSaveContent}
          onSelectionChange={(selectionText) => {
            if (!canRewriteSelection) {
              setSelectedText("");
              return;
            }

            setSelectedText(selectionText);
          }}
          status={status}
          suggestions={metadata ? metadata.suggestions : []}
        />

        {metadata?.suggestions && metadata.suggestions.length > 0 ? (
          <div className="h-dvh w-12 shrink-0 md:hidden" />
        ) : null}
      </div>
    );
  },
  actions: [
    {
      icon: <RotateCcwIcon size={18} />,
      description: "View changes",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("toggle");
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <UndoIcon size={18} />,
      description: "View Previous version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("prev");
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: "View Next version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("next");
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: "Copy to clipboard",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!");
      },
    },
  ],
  toolbar: [
    {
      icon: <PenIcon size={16} />,
      description: "Add final polish",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Please add final polish and check for grammar, add section titles for better structure, and ensure everything reads smoothly.",
            },
          ],
        });
      },
    },
    {
      icon: <MessageSquareIcon size={16} />,
      description: "Request suggestions",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Please add suggestions you have that could improve the writing.",
            },
          ],
        });
      },
    },
  ],
});

type SelectionRewritePromptProps = {
  selection: string;
  onPrompt: (intent: RewriteIntent) => void;
  onClearSelection: () => void;
  lastPrompt: string;
};

const rewriteIntents: {
  label: string;
  intent: RewriteIntent;
  helper: string;
}[] = [
  {
    label: "Rewrite",
    intent: "rewrite",
    helper: "Improve clarity and flow",
  },
  {
    label: "Shorten",
    intent: "shorten",
    helper: "Make the selection concise",
  },
  {
    label: "Expand",
    intent: "expand",
    helper: "Add richer detail",
  },
];

const SelectionRewritePrompt = ({
  selection,
  onPrompt,
  onClearSelection,
  lastPrompt,
}: SelectionRewritePromptProps) => {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-background/80 p-4 shadow-sm dark:border-zinc-700 dark:bg-muted/60">
      <div className="flex flex-row items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="font-medium">Rewrite selection</div>
          <div className="text-muted-foreground text-sm">
            Choose how you want the assistant to transform the highlighted text.
          </div>
        </div>

        <Button onClick={onClearSelection} size="sm" variant="ghost">
          Clear
        </Button>
      </div>

      <div className="rounded-xl bg-muted p-3 text-sm dark:bg-background">
        “{selection}”
      </div>

      <div className="flex flex-wrap gap-2">
        {rewriteIntents.map(({ label, intent, helper }) => (
          <Button
            className="min-w-[140px] flex-1 justify-between"
            key={intent}
            onClick={() => onPrompt(intent)}
            type="button"
            variant="outline"
          >
            <span className="text-left">
              <div className="font-medium leading-tight">{label}</div>
              <div className="text-muted-foreground text-xs">{helper}</div>
            </span>
          </Button>
        ))}
      </div>

      {lastPrompt ? (
        <div className="rounded-xl border bg-background/60 p-3 text-muted-foreground text-xs dark:border-zinc-700 dark:bg-muted/40">
          Last rewrite request sent:
          <div className="mt-1 line-clamp-3 font-medium text-foreground">
            {lastPrompt}
          </div>
        </div>
      ) : null}
    </div>
  );
};
