import { cookies } from "next/headers";
import { Suspense } from "react";
import { getAvailableChatModels } from "@/app/actions/models";
import { ChatPageContent } from "@/components/chat-page-content";
import { DEFAULT_CHAT_MODEL, getValidChatModelId } from "@/lib/ai/models";
import { getProjectsVisibleToUser } from "@/lib/db/queries";
import { serializeProject } from "@/lib/project-context";
import { generateUUID } from "@/lib/utils";
import { auth } from "../(auth)/auth";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex h-dvh" />}>
      <NewChatPage />
    </Suspense>
  );
}

async function NewChatPage() {
  const session = await auth();

  // Middleware will handle redirecting unauthenticated users
  if (!session) {
    return null;
  }

  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");
  const projectFromCookie = cookieStore.get("chat-project");
  const initialChatModel = getValidChatModelId(
    modelIdFromCookie?.value || DEFAULT_CHAT_MODEL
  );

  const projects = await getProjectsVisibleToUser({
    userId: session.user?.id as string,
  });

  const serializedProjects = projects.map(serializeProject);
  const _initialProjectId = serializedProjects.find(
    (project) => project.id === projectFromCookie?.value
  )?.id;

  const availableModels = await getAvailableChatModels();

  return (
    <ChatPageContent
      autoResume={false}
      availableModels={availableModels}
      id={id}
      initialChatModel={initialChatModel}
      initialMessages={[]}
      initialProjectId={undefined}
      initialProjects={serializedProjects}
      initialVisibilityType="private"
      isReadonly={false}
      key={id}
    />
  );
}
