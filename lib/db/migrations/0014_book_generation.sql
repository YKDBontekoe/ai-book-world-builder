-- Book Generation Pipeline Tables
-- Tracks the 6-stage AI book generation process

-- Scenes within chapters (granular story units)
CREATE TABLE IF NOT EXISTS "Scene" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  "title" TEXT NOT NULL,
  "sequence" INTEGER NOT NULL,
  "content" TEXT,
  "status" VARCHAR(32) NOT NULL DEFAULT 'planned',
  "chapterId" UUID NOT NULL REFERENCES "Chapter"("id"),
  "projectId" UUID NOT NULL REFERENCES "Project"("id")
);

CREATE INDEX IF NOT EXISTS "scene_chapter_idx" ON "Scene"("chapterId");
CREATE UNIQUE INDEX IF NOT EXISTS "scene_sequence_chapter_idx" ON "Scene"("chapterId", "sequence");

-- Scene planning cards with emotional beats and character goals
CREATE TABLE IF NOT EXISTS "SceneCard" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  "purpose" TEXT NOT NULL,
  "setting" TEXT,
  "atmosphere" TEXT,
  "emotionalBeats" JSONB,
  "characterGoals" JSONB,
  "constraints" JSONB,
  "plannedReveal" TEXT,
  "sceneId" UUID NOT NULL REFERENCES "Scene"("id"),
  "projectId" UUID NOT NULL REFERENCES "Project"("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "scene_card_scene_idx" ON "SceneCard"("sceneId");

-- Book generation tracking (pipeline progress per project)
CREATE TABLE IF NOT EXISTS "BookGeneration" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  "status" VARCHAR(32) NOT NULL DEFAULT 'idle',
  "currentStage" INTEGER NOT NULL DEFAULT 0,
  "stageProgress" JSONB,
  "error" TEXT,
  "startedAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "outlineId" UUID REFERENCES "Outline"("id"),
  "projectId" UUID NOT NULL REFERENCES "Project"("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "book_generation_project_idx" ON "BookGeneration"("projectId");

-- Story state accumulator (tracks injuries, reveals, relationship changes)
CREATE TABLE IF NOT EXISTS "StoryState" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  "chapterNumber" INTEGER NOT NULL,
  "characterKnowledge" JSONB,
  "characterInjuries" JSONB,
  "relationshipChanges" JSONB,
  "openThreads" JSONB,
  "revealsMade" JSONB,
  "worldStateChanges" JSONB,
  "generationId" UUID NOT NULL REFERENCES "BookGeneration"("id"),
  "projectId" UUID NOT NULL REFERENCES "Project"("id")
);

CREATE INDEX IF NOT EXISTS "story_state_generation_idx" ON "StoryState"("generationId");
CREATE UNIQUE INDEX IF NOT EXISTS "story_state_chapter_idx" ON "StoryState"("generationId", "chapterNumber");
