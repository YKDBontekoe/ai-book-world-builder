import "server-only";
import { asc, eq } from "drizzle-orm";
import { type DbTransaction, db } from "@/lib/db";
import { stream } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";

export async function createStreamId({
	streamId,
	chatId,
	tx,
}: {
	streamId: string;
	chatId: string;
	tx?: DbTransaction;
}) {
	try {
		await (tx || db)
			.insert(stream)
			.values({ id: streamId, chatId, createdAt: new Date() });
	} catch (_error) {
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to create stream id",
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

		return streamIds.map(({ id }: { id: string }) => id);
	} catch (_error) {
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to get stream ids by chat id",
		);
	}
}
