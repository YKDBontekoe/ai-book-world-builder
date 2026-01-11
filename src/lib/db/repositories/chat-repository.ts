import "server-only";
import { and, desc, eq, gt, inArray, lt, type SQL } from "drizzle-orm";
import type { VisibilityType } from "@/components/organisms/chat/visibility-selector";
import { type DbTransaction, db } from "@/lib/db";
import { type Chat, chat, message, stream, vote } from "@/lib/db/schema";
import { DatabaseError, NotFoundError } from "@/lib/errors";
import type { AppUsage } from "@/lib/usage";
import { BaseRepository, type FindOptions } from "./base-repository";

// ============================================================================
// Types
// ============================================================================

export interface CreateChatInput {
	id: string;
	userId: string;
	title: string;
	visibility: VisibilityType;
}

export interface UpdateChatInput {
	title?: string;
	visibility?: VisibilityType;
	lastContext?: AppUsage;
}

export interface ChatPaginationOptions {
	limit: number;
	startingAfter?: string | null;
	endingBefore?: string | null;
}

export interface PaginatedChats {
	chats: Chat[];
	hasMore: boolean;
}

// ============================================================================
// Repository Implementation
// ============================================================================

export class ChatRepository extends BaseRepository<
	Chat,
	CreateChatInput,
	UpdateChatInput
> {
	/**
	 * Find a chat by ID
	 */
	async findById(id: string): Promise<Chat | null> {
		try {
			const [result] = await db.select().from(chat).where(eq(chat.id, id));
			return result ?? null;
		} catch (error) {
			console.error("ChatRepository.findById error:", error);
			throw new DatabaseError("Failed to get chat by id");
		}
	}

	/**
	 * Find all chats (not commonly used)
	 */
	async findAll(_options?: FindOptions): Promise<Chat[]> {
		try {
			return await db.select().from(chat).orderBy(desc(chat.createdAt));
		} catch (error) {
			console.error("ChatRepository.findAll error:", error);
			throw new DatabaseError("Failed to list chats");
		}
	}

	/**
	 * Find chats by user ID with pagination
	 */
	async findByUserPaginated(
		userId: string,
		options: ChatPaginationOptions,
	): Promise<PaginatedChats> {
		const { limit, startingAfter, endingBefore } = options;

		try {
			const extendedLimit = limit + 1;

			const query = (whereCondition?: SQL<unknown>) =>
				db
					.select()
					.from(chat)
					.where(
						whereCondition
							? and(whereCondition, eq(chat.userId, userId))
							: eq(chat.userId, userId),
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
					throw NotFoundError.forResource("Chat", startingAfter);
				}

				filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
			} else if (endingBefore) {
				const [selectedChat] = await db
					.select()
					.from(chat)
					.where(eq(chat.id, endingBefore))
					.limit(1);

				if (!selectedChat) {
					throw NotFoundError.forResource("Chat", endingBefore);
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
		} catch (error) {
			if (error instanceof NotFoundError) throw error;
			console.error("ChatRepository.findByUserPaginated error:", error);
			throw new DatabaseError("Failed to get chats by user id");
		}
	}

	/**
	 * Create a new chat
	 */
	async create(data: CreateChatInput, tx?: DbTransaction): Promise<Chat> {
		try {
			const [created] = await (tx || db)
				.insert(chat)
				.values({
					...data,
					createdAt: new Date(),
				})
				.returning();

			return created;
		} catch (error) {
			console.error("ChatRepository.create error:", error);
			throw new DatabaseError("Failed to save chat");
		}
	}

	/**
	 * Update an existing chat
	 */
	async update(id: string, data: UpdateChatInput): Promise<Chat> {
		try {
			const [updated] = await db
				.update(chat)
				.set(data)
				.where(eq(chat.id, id))
				.returning();

			if (!updated) {
				throw NotFoundError.forResource("Chat", id);
			}

			return updated;
		} catch (error) {
			if (error instanceof NotFoundError) throw error;
			console.error("ChatRepository.update error:", error);
			throw new DatabaseError("Failed to update chat");
		}
	}

	/**
	 * Update chat visibility
	 */
	async updateVisibility(
		chatId: string,
		visibility: VisibilityType,
	): Promise<void> {
		try {
			await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
		} catch (error) {
			console.error("ChatRepository.updateVisibility error:", error);
			throw new DatabaseError("Failed to update chat visibility");
		}
	}

	/**
	 * Update chat's last context (usage tracking)
	 */
	async updateLastContext(chatId: string, context: AppUsage): Promise<void> {
		try {
			await db
				.update(chat)
				.set({ lastContext: context })
				.where(eq(chat.id, chatId));
		} catch (error) {
			// Non-critical, just log
			console.warn("Failed to update lastContext for chat", chatId, error);
		}
	}

	/**
	 * Delete a chat by ID (with cascade to messages, votes, streams)
	 */
	async delete(id: string): Promise<void> {
		try {
			await db.delete(vote).where(eq(vote.chatId, id));
			await db.delete(message).where(eq(message.chatId, id));
			await db.delete(stream).where(eq(stream.chatId, id));
			await db.delete(chat).where(eq(chat.id, id));
		} catch (error) {
			console.error("ChatRepository.delete error:", error);
			throw new DatabaseError("Failed to delete chat");
		}
	}

	/**
	 * Delete all chats for a user
	 */
	async deleteAllByUser(userId: string): Promise<{ deletedCount: number }> {
		try {
			const userChats = await db
				.select({ id: chat.id })
				.from(chat)
				.where(eq(chat.userId, userId));

			if (userChats.length === 0) {
				return { deletedCount: 0 };
			}

			const chatIds = userChats.map((c: { id: string }) => c.id);

			await db.delete(vote).where(inArray(vote.chatId, chatIds));
			await db.delete(message).where(inArray(message.chatId, chatIds));
			await db.delete(stream).where(inArray(stream.chatId, chatIds));

			const deletedChats = await db
				.delete(chat)
				.where(eq(chat.userId, userId))
				.returning();

			return { deletedCount: deletedChats.length };
		} catch (error) {
			console.error("ChatRepository.deleteAllByUser error:", error);
			throw new DatabaseError("Failed to delete all chats");
		}
	}
}

// Export singleton instance
export const chatRepository = new ChatRepository();
