-- Enhanced Book Generation Schema
-- Adds generation steps, assets, templates, version history, and notes

-- Extend BookGeneration table with new fields
ALTER TABLE "BookGeneration"
ADD COLUMN IF NOT EXISTS "settings" JSONB,
ADD COLUMN IF NOT EXISTS "pausedAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "currentStepId" UUID,
ADD COLUMN IF NOT EXISTS "totalSteps" INTEGER,
ADD COLUMN IF NOT EXISTS "completedSteps" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "estimatedCost" JSONB,
ADD COLUMN IF NOT EXISTS "templateId" UUID;

-- Generation Steps: Per-step tracking for generation pipeline
CREATE TABLE IF NOT EXISTS "BookGenerationStep" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "generationId" UUID NOT NULL REFERENCES "BookGeneration"("id") ON DELETE CASCADE,
    "chapterId" UUID REFERENCES "Chapter"("id") ON DELETE SET NULL,
    "sequence" INTEGER NOT NULL,
    "stepType" VARCHAR(32) NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'pending',
    "revisionRound" INTEGER DEFAULT 1,
    "agentOutput" TEXT,
    "reviewFeedback" TEXT,
    "wordCount" INTEGER,
    "tokenCount" INTEGER,
    "startedAt" TIMESTAMP,
    "completedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "book_generation_step_generation_idx" ON "BookGenerationStep"("generationId");
CREATE INDEX IF NOT EXISTS "book_generation_step_sequence_idx" ON "BookGenerationStep"("generationId", "sequence");

-- Generation Assets: Covers, blurbs, character sheets, etc.
CREATE TABLE IF NOT EXISTS "BookGenerationAsset" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "generationId" UUID NOT NULL REFERENCES "BookGeneration"("id") ON DELETE CASCADE,
    "assetType" VARCHAR(32) NOT NULL,
    "content" TEXT,
    "imageUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "book_generation_asset_generation_idx" ON "BookGenerationAsset"("generationId");
CREATE INDEX IF NOT EXISTS "book_generation_asset_type_idx" ON "BookGenerationAsset"("generationId", "assetType");

-- Generation Templates: Built-in and custom presets
CREATE TABLE IF NOT EXISTS "GenerationTemplate" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "settings" JSONB NOT NULL,
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT false,
    "userId" UUID REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "generation_template_user_idx" ON "GenerationTemplate"("userId");

-- Chapter Version History
CREATE TABLE IF NOT EXISTS "ChapterVersion" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "chapterId" UUID NOT NULL REFERENCES "Chapter"("id") ON DELETE CASCADE,
    "generationId" UUID REFERENCES "BookGeneration"("id") ON DELETE SET NULL,
    "content" TEXT NOT NULL,
    "wordCount" INTEGER,
    "version" INTEGER NOT NULL,
    "createdBy" VARCHAR(32) DEFAULT 'ai',
    "createdAt" TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "chapter_version_chapter_idx" ON "ChapterVersion"("chapterId");
CREATE INDEX IF NOT EXISTS "chapter_version_version_idx" ON "ChapterVersion"("chapterId", "version");

-- Collaboration Notes
CREATE TABLE IF NOT EXISTS "GenerationNote" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "generationId" UUID NOT NULL REFERENCES "BookGeneration"("id") ON DELETE CASCADE,
    "chapterId" UUID REFERENCES "Chapter"("id") ON DELETE SET NULL,
    "content" TEXT NOT NULL,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "appliedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "generation_note_generation_idx" ON "GenerationNote"("generationId");
CREATE INDEX IF NOT EXISTS "generation_note_chapter_idx" ON "GenerationNote"("chapterId");

-- Insert built-in templates
INSERT INTO "GenerationTemplate" ("id", "name", "description", "settings", "isBuiltIn", "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid(), 'Quick Draft', 'Fast drafting with minimal revision', 
     '{"totalChapters": 5, "pagesPerChapter": 5, "revisionRounds": 1, "writingStylePreset": "king", "includePrologue": false, "includeEpilogue": false, "generateBackCoverBlurb": true, "generateFrontCover": true, "generateCharacterSheets": false, "generateChapterSummaries": false, "generateTableOfContents": true, "runConsistencyCheck": false}'::jsonb,
     true, NOW(), NOW()),
    (gen_random_uuid(), 'Literary Novel', 'Detailed, polished prose with multiple revisions',
     '{"totalChapters": 20, "pagesPerChapter": 15, "revisionRounds": 3, "writingStylePreset": "tolkien", "includePrologue": true, "includeEpilogue": true, "generateBackCoverBlurb": true, "generateFrontCover": true, "generateCharacterSheets": true, "generateChapterSummaries": true, "generateTableOfContents": true, "runConsistencyCheck": true}'::jsonb,
     true, NOW(), NOW()),
    (gen_random_uuid(), 'Thriller', 'Fast-paced with tension and suspense',
     '{"totalChapters": 15, "pagesPerChapter": 8, "revisionRounds": 2, "writingStylePreset": "king", "includePrologue": true, "includeEpilogue": false, "generateBackCoverBlurb": true, "generateFrontCover": true, "generateCharacterSheets": false, "generateChapterSummaries": false, "generateTableOfContents": true, "runConsistencyCheck": true}'::jsonb,
     true, NOW(), NOW()),
    (gen_random_uuid(), 'Short Story', 'Single chapter, polished piece',
     '{"totalChapters": 1, "pagesPerChapter": 10, "revisionRounds": 2, "writingStylePreset": "hemingway", "includePrologue": false, "includeEpilogue": false, "generateBackCoverBlurb": true, "generateFrontCover": true, "generateCharacterSheets": false, "generateChapterSummaries": false, "generateTableOfContents": false, "runConsistencyCheck": false}'::jsonb,
     true, NOW(), NOW())
ON CONFLICT DO NOTHING;
