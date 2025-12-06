import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/app/(auth)/auth";
import { ChatPageContent } from "@/components/chat-page-content";
import { DEFAULT_CHAT_MODEL, getValidChatModelId } from "@/lib/ai/models";
import {
  getChatById,
  getMessagesByChatId,
  getProjectsVisibleToUser,
} from "@/lib/db/queries";
import { serializeProject } from "@/lib/project-context";
import { convertToUIMessages } from "@/lib/utils";

export default function Page(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="flex h-dvh" />}>
      <ChatPage params={props.params} />
    </Suspense>
  );
}

async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const session = await auth();

  if (!session) {
    redirect("/api/auth/guest");
  }

  if (chat.visibility === "private") {
    if (!session.user) {
      return notFound();
    }

    if (session.user.id !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  const uiMessages = convertToUIMessages(messagesFromDb);

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get("chat-model");
  const projectFromCookie = cookieStore.get("chat-project");
  const initialChatModel = getValidChatModelId(
    chatModelFromCookie?.value || DEFAULT_CHAT_MODEL
  );

  const projects = await getProjectsVisibleToUser({
    userId: session.user?.id as string,
  });

  const serializedProjects = projects.map(serializeProject);
  const initialProjectId = serializedProjects.find(
    (project) => project.id === projectFromCookie?.value
  )?.id;

  return (
    <ChatPageContent
      autoResume={true}
      id={chat.id}
      initialChatModel={initialChatModel}
      initialLastContext={chat.lastContext ?? undefined}
      initialMessages={uiMessages}
      initialProjectId={initialProjectId}
      initialProjects={serializedProjects}
      initialVisibilityType={chat.visibility}
      isReadonly={session?.user?.id !== chat.userId}
    />
  );
}
