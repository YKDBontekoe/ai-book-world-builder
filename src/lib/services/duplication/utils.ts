import type { DbTransaction } from "@/lib/db";

export async function chunkedInsert<T extends Record<string, unknown>, TTable>(
	tx: DbTransaction,
	table: TTable,
	items: T[],
	chunkSize = 1000,
): Promise<void> {
	for (let i = 0; i < items.length; i += chunkSize) {
		const chunk = items.slice(i, i + chunkSize);
		// @ts-expect-error - Drizzle types for insert are complex but this is safe
		await tx.insert(table).values(chunk);
	}
}
