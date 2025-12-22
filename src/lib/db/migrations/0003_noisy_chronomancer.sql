CREATE INDEX "document_user_idx" ON "Document" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "project_user_idx" ON "Project" USING btree ("userId");