# Database Patterns (Drizzle ORM)

This document outlines the specific Drizzle ORM patterns used in `lib/db/queries.ts` and `lib/db/schema.ts`.

## Schema Definition
We use `drizzle-orm/pg-core` with UUIDs as primary keys.

```typescript
// lib/db/schema.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: uuid("userId").notNull().references(() => user.id),
  // ...
});
```

## Query Patterns

### Select with typed return
We leverage TypeScript inference.

```typescript
// lib/db/queries.ts
export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db
      .select()
      .from(chat)
      .where(eq(chat.id, id));
      
    return selectedChat ?? null;
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to get chat by id");
  }
}
```

### Insert and Return
Often used to return the created object immediately.

```typescript
export async function saveChat({ id, userId, title }: ChatParams) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
    });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save chat");
  }
}
```

### Conditional Queries
We use helper functions to build dynamic queries, especially for pagination.

```typescript
// lib/db/queries.ts
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
    .limit(limit);
```

## Error Handling Pattern
All database functions must be wrapped in `try/catch` blocks and throw a `ChatSDKError`.

```typescript
try {
  // db operation
} catch (_error) {
  throw new ChatSDKError(
    "bad_request:database",
    "Specific error message"
  );
}
```

## Security & Authorization
When accessing resources tied to a project (e.g., scenes, entities), **always verify project ownership** in Server Actions before performing operations.

```typescript
// app/actions/example.ts
const project = await getProjectByIdWithAccess({ id: projectId, userId: session.user.id });
if (!project || project.userId !== session.user.id) {
    throw new Error("Unauthorized");
}
```

Additionally, pass the `projectId` to database queries to ensure the resource belongs to the expected project (preventing IDOR):

```typescript
// lib/db/queries/example.ts
.where(and(eq(table.id, id), eq(table.projectId, projectId)))
```
