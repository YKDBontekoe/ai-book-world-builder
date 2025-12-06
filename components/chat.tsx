"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { ChatHeader } from "@/components/chat-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useArtifactSelector } from "@/hooks/use-artifact";
import { useAutoResume } from "@/hooks/use-auto-resume";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import { useProjectSelection } from "@/hooks/use-project-selection";
import type { ChatModel, ChatModelId } from "@/lib/ai/models";
import type { Vote } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";
import type { ProjectSummary } from "@/lib/project-context";
import type { Attachment, ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { fetcher, fetchWithErrorHandlers, generateUUID } from "@/lib/utils";
import { Artifact } from "./artifact";
import { useDataStream } from "./data-stream-provider";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";
import { getChatHistoryPaginationKey } from "./sidebar-history";
import { toast } from "./toast";
import type { VisibilityType } from "./visibility-selector";

type QuickStartCard = {
  title: string;
  description: string;
  prompt: string;
};

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialProjectId,
  initialProjects = [],
  initialVisibilityType,
  isReadonly,
  autoResume,
  initialLastContext,
  availableModels,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: ChatModelId;
  initialProjectId?: string | null;
  initialProjects?: ProjectSummary[];
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume: boolean;
  initialLastContext?: AppUsage;
  availableModels: ChatModel[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const projects = useMemo(() => initialProjects ?? [], [initialProjects]);
  const {
    applyProjectSelection,
    selectedProject,
    selectedProjectId,
    selectedProjectIdRef,
  } = useProjectSelection({
    initialProjectId,
    projects,
  });

  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const { mutate } = useSWRConfig();

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      // When user navigates back/forward, refresh to sync with URL
      router.refresh();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router]);
  const { setDataStream } = useDataStream();

  const [input, setInput] = useState<string>("");
  const [usage, setUsage] = useState<AppUsage | undefined>(initialLastContext);
  const [showCreditCardAlert, setShowCreditCardAlert] = useState(false);
  const [currentModelId, setCurrentModelId] =
    useState<ChatModelId>(initialChatModel);
  const currentModelIdRef = useRef(currentModelId);

  useEffect(() => {
    currentModelIdRef.current = currentModelId;
  }, [currentModelId]);

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    experimental_throttle: 100,
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest(request) {
        return {
          body: {
            id: request.id,
            message: request.messages.at(-1),
            projectId: selectedProjectIdRef.current,
            selectedChatModel: currentModelIdRef.current,
            selectedVisibilityType: visibilityType,
            ...request.body,
          },
        };
      },
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
      if (dataPart.type === "data-usage") {
        setUsage(dataPart.data);
      }
    },
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    onError: (error) => {
      if (error instanceof ChatSDKError) {
        // Check if it's a credit card error
        if (
          error.message?.includes("AI Gateway requires a valid credit card")
        ) {
          setShowCreditCardAlert(true);
        } else {
          toast({
            type: "error",
            description: error.message,
          });
        }
      }
    },
  });
  const query = searchParams.get("query");

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: "user" as const,
        parts: [{ type: "text", text: query }],
      });

      setHasAppendedQuery(true);
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete("query");
      router.replace(`/chat/${id}${currentUrl.search}`);
    }
  }, [query, sendMessage, hasAppendedQuery, id, router]);

  const { data: votes } = useSWR<Vote[]>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher
  );

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  const quickStartCards = useMemo<QuickStartCard[]>(
    () => [
      {
        title: "Design a character",
        description:
          "Create a character profile with goals, secrets, and connections to existing factions.",
        prompt:
          "Design a new character for this world and outline their motivations, challenges, and relationships.",
      },
      {
        title: "Outline a faction",
        description:
          "Draft a faction's purpose, resources, and key members grounded in your world's timeline.",
        prompt:
          "Outline a faction that fits the project's setting. Describe its agenda, leaders, and conflicts.",
      },
      {
        title: "Populate a location",
        description:
          "Describe a location with notable landmarks, threats, and how it ties to nearby entities.",
        prompt:
          "Populate a location with sensory details, inhabitants, and story hooks that align with the project.",
      },
    ],
    []
  );

  const handleQuickStart = useCallback(
    (card: QuickStartCard) => {
      const targetProjectId = selectedProjectId ?? projects[0]?.id ?? null;

      if (!targetProjectId) {
        toast({
          description: "Select or create a project to ground quick starts.",
          type: "error",
        });
        return;
      }

      if (selectedProjectId !== targetProjectId) {
        applyProjectSelection(targetProjectId);
      }

      const projectName =
        projects.find((project) => project.id === targetProjectId)?.name ??
        "this project";
      const scopedPrompt = `${card.prompt} Keep the response specific to the "${projectName}" project, referencing its folders and entities when relevant.`;

      setInput(scopedPrompt);
      sendMessage({
        role: "user" as const,
        parts: [{ type: "text", text: scopedPrompt }],
      });
    },
    [applyProjectSelection, projects, selectedProjectId, sendMessage]
  );

  return (
    <>
      <div className="flex h-dvh min-w-0 flex-col bg-background">
        <div className="border-b bg-muted/40">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Project context
                </p>
                <h2 className="font-semibold text-lg">
                  Ground responses in your world
                </h2>
                <p className="text-muted-foreground text-sm">
                  {selectedProject
                    ? `Working in ${selectedProject.name} — project folders and entities will guide the agent.`
                    : "Select a project to anchor quick starts and AI context."}
                </p>
              </div>
              <Button asChild size="sm" variant="secondary">
                <Link href="/projects/new">Create project</Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {projects.length === 0 ? (
                <Badge variant="secondary">No projects yet</Badge>
              ) : (
                projects.slice(0, 4).map((project) => (
                  <Button
                    aria-pressed={project.id === selectedProjectId}
                    key={project.id}
                    onClick={() => applyProjectSelection(project.id)}
                    size="sm"
                    variant={
                      project.id === selectedProjectId ? "default" : "outline"
                    }
                  >
                    {project.name}
                  </Button>
                ))
              )}

              {projects.length > 4 && (
                <Badge variant="outline">+{projects.length - 4} more</Badge>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {quickStartCards.map((card) => (
                <Card
                  className="border-dashed transition focus-within:border-primary hover:border-primary"
                  key={card.title}
                >
                  <button
                    className="flex h-full w-full flex-col items-start gap-2 text-left"
                    onClick={() => handleQuickStart(card)}
                    type="button"
                  >
                    <CardHeader className="pb-0">
                      <CardTitle className="text-base">{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm">
                      {card.description}
                    </CardContent>
                  </button>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="overscroll-behavior-contain flex min-w-0 flex-1 touch-pan-y flex-col">
          <ChatHeader
            chatId={id}
            isReadonly={isReadonly}
            projectLabel={selectedProject?.name}
            selectedVisibilityType={initialVisibilityType}
          />

          <Messages
            chatId={id}
            isArtifactVisible={isArtifactVisible}
            isReadonly={isReadonly}
            messages={messages}
            regenerate={regenerate}
            selectedModelId={initialChatModel}
            setMessages={setMessages}
            status={status}
            votes={votes}
          />

          <div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
            {!isReadonly && (
              <MultimodalInput
                attachments={attachments}
                availableModels={availableModels}
                chatId={id}
                input={input}
                messages={messages}
                onModelChange={setCurrentModelId}
                selectedModelId={currentModelId}
                selectedVisibilityType={visibilityType}
                sendMessage={sendMessage}
                setAttachments={setAttachments}
                setInput={setInput}
                setMessages={setMessages}
                status={status}
                stop={stop}
                usage={usage}
              />
            )}
          </div>
        </div>
      </div>

      <Artifact
        attachments={attachments}
        availableModels={availableModels}
        chatId={id}
        input={input}
        isReadonly={isReadonly}
        messages={messages}
        regenerate={regenerate}
        selectedModelId={currentModelId}
        selectedVisibilityType={visibilityType}
        sendMessage={sendMessage}
        setAttachments={setAttachments}
        setInput={setInput}
        setMessages={setMessages}
        status={status}
        stop={stop}
        votes={votes}
      />

      <AlertDialog
        onOpenChange={setShowCreditCardAlert}
        open={showCreditCardAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate AI Gateway</AlertDialogTitle>
            <AlertDialogDescription>
              This application requires{" "}
              {process.env.NODE_ENV === "production" ? "the owner" : "you"} to
              activate Vercel AI Gateway.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                window.open(
                  "https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card",
                  "_blank"
                );
                window.location.href = "/";
              }}
            >
              Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
