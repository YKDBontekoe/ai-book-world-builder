CREATE TABLE IF NOT EXISTS "Volume" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp NOT NULL,
    "title" text NOT NULL,
    "summary" text,
    "outlineId" uuid NOT NULL,
    "projectId" uuid NOT NULL,
    CONSTRAINT "Volume_outlineId_Outline_id_fk" FOREIGN KEY ("outlineId") REFERENCES "Outline"("id"),
    CONSTRAINT "Volume_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "Project"("id")
);

CREATE TABLE IF NOT EXISTS "Chapter" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp NOT NULL,
    "title" text NOT NULL,
    "notes" text,
    "status" varchar(32) DEFAULT 'planned' NOT NULL,
    "sequence" integer NOT NULL,
    "outlineId" uuid NOT NULL,
    "volumeId" uuid NOT NULL,
    "projectId" uuid NOT NULL,
    CONSTRAINT "Chapter_outlineId_Outline_id_fk" FOREIGN KEY ("outlineId") REFERENCES "Outline"("id"),
    CONSTRAINT "Chapter_volumeId_Volume_id_fk" FOREIGN KEY ("volumeId") REFERENCES "Volume"("id"),
    CONSTRAINT "Chapter_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "Project"("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "chapter_sequence_volume_idx" ON "Chapter" ("volumeId","sequence");

CREATE TABLE IF NOT EXISTS "ChapterDraft" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp NOT NULL,
    "content" text NOT NULL,
    "chapterId" uuid NOT NULL,
    "volumeId" uuid NOT NULL,
    "outlineId" uuid NOT NULL,
    "projectId" uuid NOT NULL,
    CONSTRAINT "ChapterDraft_chapterId_Chapter_id_fk" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id"),
    CONSTRAINT "ChapterDraft_volumeId_Volume_id_fk" FOREIGN KEY ("volumeId") REFERENCES "Volume"("id"),
    CONSTRAINT "ChapterDraft_outlineId_Outline_id_fk" FOREIGN KEY ("outlineId") REFERENCES "Outline"("id"),
    CONSTRAINT "ChapterDraft_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "Project"("id")
);
