"use server";

import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/drizzle";
import { account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getConnectedAccounts() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    const accounts = await db
      .select({
        provider: account.provider,
      })
      .from(account)
      .where(eq(account.userId, session.user.id));

    return accounts;
  } catch (error) {
    console.error("Failed to fetch connected accounts:", error);
    return [];
  }
}
