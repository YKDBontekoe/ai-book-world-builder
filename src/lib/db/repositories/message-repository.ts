import "server-only";
import { and, asc, count, eq, gte, inArray } from "drizzle-orm";
import { type DbTransaction, db } from "@/lib/db/drizzle";
import {
	chat,
	type DBMessage,
	message,
	type Vote,
	vote,
} from "@/lib/db/schema";
import { DatabaseError, NotFoundError } from "@/lib/errors";
import { BaseRepository, type FindOptions } from "./base-repository";

// ============================================================================
// Types
// ============================================================================

export interface CreateMessageInput {
	id?: string;
	chatId: string;
	role: string;
	parts: unknown;
	attachments?: unknown;
	createdAt?: Date;
}

export interface UpdateMessageInput {
	parts?: unknown;
	attachments?: unknown;
}

export interface VoteInput {
	chatId: string;
	messageId: string;
	type: "up" | "down";
}

// ============================================================================
// Repository Implementation
// ============================================================================

export class MessageRepository extends BaseRepository<
	DBMessage,
	CreateMessageInput,
	UpdateMessageInput
> {
	/**
	 * Find a message by ID
	 */
	async findById(id: string): Promise<DBMessage | null> {
		try {
			const [result] = await db
				.select()
				.from(message)
				.where(eq(message.id, id));
			return result ?? null;
		} catch (error) {
			console.error("MessageRepository.findById error:", error);
			throw new DatabaseError("Failed to get message by id");
		}
	}

	/**
	 * Find all messages (not commonly used)
	 */
	async findAll(_options?: FindOptions): Promise<DBMessage[]> {
		try {
			return await db.select().from(message).orderBy(asc(message.createdAt));
		} catch (error) {
			console.error("MessageRepository.findAll error:", error);
			throw new DatabaseError("Failed to list messages");
		}
	}

	/**
	 * Find messages by chat ID
	 */
	async findByChatId(chatId: string): Promise<DBMessage[]> {
		try {
			return await db
				.select()
				.from(message)
				.where(eq(message.chatId, chatId))
				.orderBy(asc(message.createdAt));
		} catch (error) {
			console.error("MessageRepository.findByChatId error:", error);
			throw new DatabaseError("Failed to get messages by chat id");
		}
	}

	/**
	 * Create a new message (or batch of messages)
	 */
	async create(
		data: CreateMessageInput,
		tx?: DbTransaction,
	): Promise<DBMessage> {
		try {
			const [created] = await (tx || db)
				.insert(message)
				.values({
					...data,
					createdAt: data.createdAt ?? new Date(),
				} as DBMessage)
				.returning();

			return created;
		} catch (error) {
			console.error("MessageRepository.create error:", error);
			throw new DatabaseError("Failed to save message");
		}
	}

	/**
	 * Create multiple messages
	 */
	async createMany(messages: DBMessage[], tx?: DbTransaction): Promise<void> {
		if (messages.length === 0) return;

		try {
			await (tx || db).insert(message).values(messages);
		} catch (error) {
			console.error("MessageRepository.createMany error:", error);
			throw new DatabaseError("Failed to save messages");
		}
	}

	/**
	 * Update an existing message
	 */
	async update(id: string, data: UpdateMessageInput): Promise<DBMessage> {
		try {
			const [updated] = await db
				.update(message)
				.set(data)
				.where(eq(message.id, id))
				.returning();

			if (!updated) {
				throw NotFoundError.forResource("Message", id);
			}

			return updated;
		} catch (error) {
			if (error instanceof NotFoundError) throw error;
			console.error("MessageRepository.update error:", error);
			throw new DatabaseError("Failed to update message");
		}
	}

	/**
	 * Delete a message by ID
	 */
	async delete(id: string): Promise<void> {
		try {
			await db.delete(vote).where(eq(vote.messageId, id));
			await db.delete(message).where(eq(message.id, id));
		} catch (error) {
			console.error("MessageRepository.delete error:", error);
			throw new DatabaseError("Failed to delete message");
		}
	}

	/**
	 * Delete messages after a timestamp (for regeneration)
	 */
	async deleteAfterTimestamp(chatId: string, timestamp: Date): Promise<void> {
		try {
			const messagesToDelete = await db
				.select({ id: message.id })
				.from(message)
				.where(
					and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
				);

			const messageIds = messagesToDelete.map((m) => m.id);

			if (messageIds.length > 0) {
				await db
					.delete(vote)
					.where(
						and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
					);
				await db
					.delete(message)
					.where(
						and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
					);
			}
		} catch (error) {
			console.error("MessageRepository.deleteAfterTimestamp error:", error);
			throw new DatabaseError("Failed to delete messages");
		}
	}

	/**
	 * Get message count by user within a time window
	 */
	async getCountByUserInWindow(
		userId: string,
		hoursAgo: number,
	): Promise<number> {
		try {
			const windowStart = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

			const [stats] = await db
				.select({ count: count(message.id) })
				.from(message)
				.innerJoin(chat, eq(message.chatId, chat.id))
				.where(
					and(
						eq(chat.userId, userId),
						gte(message.createdAt, windowStart),
						eq(message.role, "user"),
					),
				)
				.execute();

			return stats?.count ?? 0;
		} catch (error) {
			console.error("MessageRepository.getCountByUserInWindow error:", error);
			throw new DatabaseError("Failed to get message count");
		}
	}

	// ============================================================================
	// Vote Operations
	// ============================================================================

	/**
	 * Vote on a message (up or down)
	 */
	async vote(input: VoteInput): Promise<void> {
		try {
			const [existingVote] = await db
				.select()
				.from(vote)
				.where(eq(vote.messageId, input.messageId));

			if (existingVote) {
				await db
					.update(vote)
					.set({ isUpvoted: input.type === "up" })
					.where(
						and(
							eq(vote.messageId, input.messageId),
							eq(vote.chatId, input.chatId),
						),
					);
			} else {
				await db.insert(vote).values({
					chatId: input.chatId,
					messageId: input.messageId,
					isUpvoted: input.type === "up",
				});
			}
		} catch (error) {
			console.error("MessageRepository.vote error:", error);
			throw new DatabaseError("Failed to vote on message");
		}
	}

	/**
	 * Get votes for a chat
	 */
	async getVotesByChatId(chatId: string): Promise<Vote[]> {
		try {
			return await db.select().from(vote).where(eq(vote.chatId, chatId));
		} catch (error) {
			console.error("MessageRepository.getVotesByChatId error:", error);
			throw new DatabaseError("Failed to get votes");
		}
	}
}

// Export singleton instance
export const messageRepository = new MessageRepository();
