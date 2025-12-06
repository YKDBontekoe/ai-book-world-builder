import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  or,
  lt,
  type SQL,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { ArtifactKind } from "@/components/artifact";
import type { VisibilityType } from "@/components/visibility-selector";
import { DEFAULT_PROJECT_FOLDERS } from "../constants";
import { ChatSDKError } from "../errors";
import type { AppUsage } from "../usage";
import { generateUUID } from "../utils";
import {
  type Chat,
  chat,
  type DBMessage,
  entity,
  entityAttribute,
  document,
  type Entity,
  type EntityAttribute,
  message,
  project,
  relationship,
  type Relationship,
  type Suggestion,
  stream,
  suggestion,
  type User,
  user,
  vote,
  type Project,
} from "./schema";
import { generateHashedPassword } from "./utils";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(email: string): Promise<User[]> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get user by email"
    );
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db.insert(user).values({ email, password: hashedPassword });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to create user");
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());

  try {
    return await db.insert(user).values({ email, password }).returning({
      id: user.id,
      email: user.email,
    });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create guest user"
    );
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
    });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save chat");
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));
    await db.delete(stream).where(eq(stream.chatId, id));

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete chat by id"
    );
  }
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
  try {
    const userChats = await db
      .select({ id: chat.id })
      .from(chat)
      .where(eq(chat.userId, userId));

    if (userChats.length === 0) {
      return { deletedCount: 0 };
    }

    const chatIds = userChats.map((c) => c.id);

    await db.delete(vote).where(inArray(vote.chatId, chatIds));
    await db.delete(message).where(inArray(message.chatId, chatIds));
    await db.delete(stream).where(inArray(stream.chatId, chatIds));

    const deletedChats = await db
      .delete(chat)
      .where(eq(chat.userId, userId))
      .returning();

    return { deletedCount: deletedChats.length };
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete all chats by user id"
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id)
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Chat[] = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          "not_found:database",
          `Chat with id ${startingAfter} not found`
        );
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          "not_found:database",
          `Chat with id ${endingBefore} not found`
        );
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get chats by user id"
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    if (!selectedChat) {
      return null;
    }

    return selectedChat;
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to get chat by id");
  }
}

export async function saveMessages({ messages }: { messages: DBMessage[] }) {
  try {
    return await db.insert(message).values(messages);
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save messages");
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get messages by chat id"
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === "up" })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === "up",
    });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to vote message");
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get votes by chat id"
    );
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db
      .insert(document)
      .values({
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
      })
      .returning();
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save document");
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get documents by id"
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get document by id"
    );
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp)
        )
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)))
      .returning();
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete documents by id after timestamp"
    );
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to save suggestions"
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(eq(suggestion.documentId, documentId));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get suggestions by document id"
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message by id"
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp))
      );

    const messageIds = messagesToDelete.map(
      (currentMessage) => currentMessage.id
    );

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds))
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds))
        );
    }
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete messages by chat id after timestamp"
    );
  }
}

export async function updateChatVisibilityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update chat visibility by id"
    );
  }
}

export async function updateChatLastContextById({
  chatId,
  context,
}: {
  chatId: string;
  // Store merged server-enriched usage object
  context: AppUsage;
}) {
  try {
    return await db
      .update(chat)
      .set({ lastContext: context })
      .where(eq(chat.id, chatId));
  } catch (error) {
    console.warn("Failed to update lastContext for chat", chatId, error);
    return;
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000
    );

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, twentyFourHoursAgo),
          eq(message.role, "user")
        )
      )
      .execute();

    return stats?.count ?? 0;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message count by user id"
    );
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db
      .insert(stream)
      .values({ id: streamId, chatId, createdAt: new Date() });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create stream id"
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streamIds = await db
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get stream ids by chat id"
    );
  }
}

export async function createProject({
  name,
  description,
  visibility,
  userId,
}: {
  name: string;
  description?: string;
  visibility: VisibilityType;
  userId: string;
}): Promise<Project> {
  try {
    const folders = DEFAULT_PROJECT_FOLDERS.map((folder) => ({ ...folder }));

    const [createdProject] = await db
      .insert(project)
      .values({
        name,
        description,
        visibility,
        userId,
        createdAt: new Date(),
        folders,
      })
      .returning();

    return createdProject;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create project"
    );
  }
}

function toDateOrUndefined(value: string | undefined | null) {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export async function createEntity({
  projectId,
  name,
  kind,
  summary,
  startDate,
  endDate,
}: {
  projectId: string;
  name: string;
  kind: string;
  summary?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Entity> {
  const parsedStart = toDateOrUndefined(startDate);
  const parsedEnd = toDateOrUndefined(endDate);

  if (parsedStart && parsedEnd && parsedStart > parsedEnd) {
    throw new ChatSDKError(
      "bad_request:validation",
      "End date cannot be before the start date."
    );
  }

  try {
    const [existing] = await db
      .select({ count: count() })
      .from(entity)
      .where(and(eq(entity.projectId, projectId), eq(entity.name, name)))
      .limit(1);

    if (existing?.count && existing.count > 0) {
      throw new ChatSDKError(
        "bad_request:validation",
        "An entity with this name already exists in the project."
      );
    }

    const [createdEntity] = await db
      .insert(entity)
      .values({
        projectId,
        name,
        kind,
        summary,
        startDate: parsedStart,
        endDate: parsedEnd,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return createdEntity;
  } catch (error) {
    const chatError = error instanceof ChatSDKError ? error : null;
    throw (
      chatError ??
      new ChatSDKError("bad_request:database", "Failed to create entity")
    );
  }
}

export async function getEntitiesForProject({
  projectId,
}: {
  projectId: string;
}): Promise<Entity[]> {
  try {
    return await db
      .select()
      .from(entity)
      .where(eq(entity.projectId, projectId))
      .orderBy(asc(entity.name));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to load entities for project"
    );
  }
}

export async function getEntityById({
  id,
}: {
  id: string;
}): Promise<Entity | null> {
  try {
    const [selectedEntity] = await db
      .select()
      .from(entity)
      .where(eq(entity.id, id));

    return selectedEntity ?? null;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to load entity by id"
    );
  }
}

export async function createEntityAttribute({
  projectId,
  entityId,
  name,
  value,
  dataType,
  startDate,
  endDate,
}: {
  projectId: string;
  entityId: string;
  name: string;
  value: string;
  dataType: string;
  startDate?: string;
  endDate?: string;
}): Promise<EntityAttribute> {
  const parsedStart = toDateOrUndefined(startDate);
  const parsedEnd = toDateOrUndefined(endDate);

  if (parsedStart && parsedEnd && parsedStart > parsedEnd) {
    throw new ChatSDKError(
      "bad_request:validation",
      "Attribute end date cannot be before the start date."
    );
  }

  try {
    const [existing] = await db
      .select({ count: count() })
      .from(entityAttribute)
      .where(
        and(eq(entityAttribute.entityId, entityId), eq(entityAttribute.name, name))
      )
      .limit(1);

    if (existing?.count && existing.count > 0) {
      throw new ChatSDKError(
        "bad_request:validation",
        "This entity already has an attribute with that name."
      );
    }

    const [createdAttribute] = await db
      .insert(entityAttribute)
      .values({
        projectId,
        entityId,
        name,
        value,
        dataType,
        startDate: parsedStart,
        endDate: parsedEnd,
        createdAt: new Date(),
      })
      .returning();

    return createdAttribute;
  } catch (error) {
    const chatError = error instanceof ChatSDKError ? error : null;
    throw (
      chatError ??
      new ChatSDKError(
        "bad_request:database",
        "Failed to create entity attribute"
      )
    );
  }
}

export async function createRelationship({
  projectId,
  sourceEntityId,
  targetEntityId,
  type,
  description,
  startDate,
  endDate,
}: {
  projectId: string;
  sourceEntityId: string;
  targetEntityId: string;
  type: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Relationship> {
  const parsedStart = toDateOrUndefined(startDate);
  const parsedEnd = toDateOrUndefined(endDate);

  if (parsedStart && parsedEnd && parsedStart > parsedEnd) {
    throw new ChatSDKError(
      "bad_request:validation",
      "Relationship end date cannot be before the start date."
    );
  }

  if (sourceEntityId === targetEntityId) {
    throw new ChatSDKError(
      "bad_request:validation",
      "An entity cannot be related to itself."
    );
  }

  try {
    const [source, target] = await Promise.all([
      db
        .select()
        .from(entity)
        .where(and(eq(entity.id, sourceEntityId), eq(entity.projectId, projectId))),
      db
        .select()
        .from(entity)
        .where(and(eq(entity.id, targetEntityId), eq(entity.projectId, projectId))),
    ]);

    if (!source.length || !target.length) {
      throw new ChatSDKError(
        "bad_request:validation",
        "Both related entities must belong to the same project."
      );
    }

    const [existingRelationship] = await db
      .select({ count: count() })
      .from(relationship)
      .where(
        and(
          eq(relationship.projectId, projectId),
          eq(relationship.sourceEntityId, sourceEntityId),
          eq(relationship.targetEntityId, targetEntityId),
          eq(relationship.type, type)
        )
      )
      .limit(1);

    if (existingRelationship?.count && existingRelationship.count > 0) {
      throw new ChatSDKError(
        "bad_request:validation",
        "This relationship already exists for the selected entities."
      );
    }

    const [createdRelationship] = await db
      .insert(relationship)
      .values({
        projectId,
        sourceEntityId,
        targetEntityId,
        type,
        description,
        startDate: parsedStart,
        endDate: parsedEnd,
        createdAt: new Date(),
      })
      .returning();

    return createdRelationship;
  } catch (error) {
    const chatError = error instanceof ChatSDKError ? error : null;
    throw (
      chatError ??
      new ChatSDKError(
        "bad_request:database",
        "Failed to create relationship"
      )
    );
  }
}

export type EntityWithDetails = Entity & {
  attributes: EntityAttribute[];
  relationships: Relationship[];
};

export async function getEntityWithDetails({
  id,
}: {
  id: string;
}): Promise<EntityWithDetails | null> {
  try {
    const [selectedEntity] = await db
      .select()
      .from(entity)
      .where(eq(entity.id, id));

    if (!selectedEntity) {
      return null;
    }

    const [attributes, relationships] = await Promise.all([
      db
        .select()
        .from(entityAttribute)
        .where(eq(entityAttribute.entityId, id))
        .orderBy(asc(entityAttribute.name)),
      db
        .select()
        .from(relationship)
        .where(
          or(
            eq(relationship.sourceEntityId, id),
            eq(relationship.targetEntityId, id)
          )
        )
        .orderBy(desc(relationship.createdAt)),
    ]);

    return { ...selectedEntity, attributes, relationships };
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to load entity details"
    );
  }
}

export async function getRelationshipsForProject({
  projectId,
}: {
  projectId: string;
}): Promise<Relationship[]> {
  try {
    return await db
      .select()
      .from(relationship)
      .where(eq(relationship.projectId, projectId))
      .orderBy(desc(relationship.createdAt));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to load relationships"
    );
  }
}

export async function getProjectsVisibleToUser({
  userId,
}: {
  userId: string;
}): Promise<Project[]> {
  try {
    return await db
      .select()
      .from(project)
      .where(or(eq(project.userId, userId), eq(project.visibility, "public")))
      .orderBy(desc(project.createdAt));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to list projects"
    );
  }
}

export async function getProjectByIdWithAccess({
  id,
  userId,
}: {
  id: string;
  userId?: string;
}): Promise<Project | null> {
  try {
    const [selectedProject] = await db
      .select()
      .from(project)
      .where(eq(project.id, id));

    if (!selectedProject) {
      return null;
    }

    if (
      selectedProject.visibility === "private" &&
      selectedProject.userId !== userId
    ) {
      return null;
    }

    return selectedProject;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to load project by id"
    );
  }
}
