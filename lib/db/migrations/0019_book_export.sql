-- Book Export Table
-- Tracks exported books in PDF/EPUB format

CREATE TABLE IF NOT EXISTS "BookExport" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP NOT NULL,
    "projectId" UUID NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
    "blobUrl" TEXT,
    "format" VARCHAR(10) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "book_export_project_idx" ON "BookExport"("projectId");
CREATE INDEX IF NOT EXISTS "book_export_user_idx" ON "BookExport"("userId");
