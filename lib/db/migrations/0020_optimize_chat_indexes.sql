CREATE INDEX IF NOT EXISTS "chat_user_id_created_at_idx" ON "Chat" USING btree ("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "message_chat_id_created_at_idx" ON "Message_v2" USING btree ("chatId", "createdAt");
