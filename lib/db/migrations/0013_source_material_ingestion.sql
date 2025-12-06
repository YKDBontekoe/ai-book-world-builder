CREATE TABLE IF NOT EXISTS "SourceMaterialProcessing" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp NOT NULL,
    "status" varchar DEFAULT 'pending' NOT NULL,
    "attempts" integer DEFAULT 0 NOT NULL,
    "nextAttemptAt" timestamp NOT NULL,
    "lastError" text,
    "startedAt" timestamp,
    "completedAt" timestamp,
    "bytesProcessed" integer DEFAULT 0 NOT NULL,
    "chapters" integer DEFAULT 0 NOT NULL,
    "chunks" integer DEFAULT 0 NOT NULL,
    "normalizedCharacters" integer DEFAULT 0 NOT NULL,
    "durationMs" integer DEFAULT 0 NOT NULL,
    "metadata" jsonb,
    "sourceMaterialId" uuid NOT NULL,
    "projectId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    CONSTRAINT "SourceMaterialProcessing_sourceMaterialId_SourceMaterial_id_fk" FOREIGN KEY ("sourceMaterialId") REFERENCES "SourceMaterial"("id"),
    CONSTRAINT "SourceMaterialProcessing_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "Project"("id"),
    CONSTRAINT "SourceMaterialProcessing_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "source_material_processing_material_idx" ON "SourceMaterialProcessing" ("sourceMaterialId");
CREATE INDEX IF NOT EXISTS "source_material_processing_project_idx" ON "SourceMaterialProcessing" ("projectId");

CREATE TABLE IF NOT EXISTS "SourceMaterialChapter" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp NOT NULL,
    "title" text NOT NULL,
    "sequence" integer NOT NULL,
    "headings" jsonb NOT NULL,
    "metadata" jsonb,
    "sourceMaterialId" uuid NOT NULL,
    "projectId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    CONSTRAINT "SourceMaterialChapter_sourceMaterialId_SourceMaterial_id_fk" FOREIGN KEY ("sourceMaterialId") REFERENCES "SourceMaterial"("id"),
    CONSTRAINT "SourceMaterialChapter_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "Project"("id"),
    CONSTRAINT "SourceMaterialChapter_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id")
);

CREATE INDEX IF NOT EXISTS "source_material_chapter_material_idx" ON "SourceMaterialChapter" ("sourceMaterialId");
CREATE INDEX IF NOT EXISTS "source_material_chapter_project_idx" ON "SourceMaterialChapter" ("projectId");

CREATE TABLE IF NOT EXISTS "SourceMaterialChunk" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp NOT NULL,
    "sequence" integer NOT NULL,
    "text" text NOT NULL,
    "metadata" jsonb,
    "chapterId" uuid NOT NULL,
    "sourceMaterialId" uuid NOT NULL,
    "projectId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    CONSTRAINT "SourceMaterialChunk_chapterId_SourceMaterialChapter_id_fk" FOREIGN KEY ("chapterId") REFERENCES "SourceMaterialChapter"("id"),
    CONSTRAINT "SourceMaterialChunk_sourceMaterialId_SourceMaterial_id_fk" FOREIGN KEY ("sourceMaterialId") REFERENCES "SourceMaterial"("id"),
    CONSTRAINT "SourceMaterialChunk_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "Project"("id"),
    CONSTRAINT "SourceMaterialChunk_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id")
);

CREATE INDEX IF NOT EXISTS "source_material_chunk_chapter_idx" ON "SourceMaterialChunk" ("chapterId");
CREATE INDEX IF NOT EXISTS "source_material_chunk_project_idx" ON "SourceMaterialChunk" ("projectId");
