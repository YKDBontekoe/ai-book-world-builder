CREATE TABLE IF NOT EXISTS "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" varchar(64) NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"password" varchar(64),
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserPreferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"favoriteModels" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"recentModels" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "UserPreferences_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Account" (
	"userId" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "Account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Chat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"title" text NOT NULL,
	"userId" uuid NOT NULL,
	"visibility" varchar DEFAULT 'private' NOT NULL,
	"lastContext" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Message_v2" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatId" uuid NOT NULL,
	"role" varchar NOT NULL,
	"parts" json NOT NULL,
	"attachments" json NOT NULL,
	"usage" jsonb,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Stream" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"chatId" uuid NOT NULL,
	"createdAt" timestamp NOT NULL,
	CONSTRAINT "Stream_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Vote_v2" (
	"chatId" uuid NOT NULL,
	"messageId" uuid NOT NULL,
	"isUpvoted" boolean NOT NULL,
	CONSTRAINT "Vote_v2_chatId_messageId_pk" PRIMARY KEY("chatId","messageId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Document" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"text" varchar DEFAULT 'text' NOT NULL,
	"userId" uuid NOT NULL,
	CONSTRAINT "Document_id_createdAt_pk" PRIMARY KEY("id","createdAt")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"visibility" varchar DEFAULT 'private' NOT NULL,
	"folders" jsonb NOT NULL,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Suggestion" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"documentId" uuid NOT NULL,
	"documentCreatedAt" timestamp NOT NULL,
	"originalText" text NOT NULL,
	"suggestedText" text NOT NULL,
	"description" text,
	"isResolved" boolean DEFAULT false NOT NULL,
	"userId" uuid NOT NULL,
	"createdAt" timestamp NOT NULL,
	CONSTRAINT "Suggestion_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SourceMaterial" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"filename" text NOT NULL,
	"mimeType" varchar(128) NOT NULL,
	"size" integer NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"blobUrl" text,
	"projectId" uuid NOT NULL,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
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
	"userId" uuid NOT NULL
);
--> statement-breakpoint
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
	"userId" uuid NOT NULL
);
--> statement-breakpoint
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
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Entity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"name" text NOT NULL,
	"kind" varchar(48) NOT NULL,
	"summary" text,
	"startDate" timestamp,
	"endDate" timestamp,
	"projectId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "EntityAttribute" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"name" text NOT NULL,
	"value" text NOT NULL,
	"dataType" varchar(48) NOT NULL,
	"startDate" timestamp,
	"endDate" timestamp,
	"entityId" uuid NOT NULL,
	"projectId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Relationship" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"type" varchar(64) NOT NULL,
	"description" text,
	"startDate" timestamp,
	"endDate" timestamp,
	"projectId" uuid NOT NULL,
	"sourceEntityId" uuid NOT NULL,
	"targetEntityId" uuid NOT NULL
);
--> statement-breakpoint
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
	"projectId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ChapterDraft" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"content" text NOT NULL,
	"chapterId" uuid NOT NULL,
	"volumeId" uuid NOT NULL,
	"outlineId" uuid NOT NULL,
	"projectId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Outline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"pov" varchar(64) NOT NULL,
	"tone" varchar(64) NOT NULL,
	"pacing" varchar(64) NOT NULL,
	"beats" jsonb,
	"projectId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Volume" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"outlineId" uuid NOT NULL,
	"projectId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "BookExport" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"projectId" uuid NOT NULL,
	"blobUrl" text,
	"format" varchar NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"error" text,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "BookGeneration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"status" varchar(32) DEFAULT 'idle' NOT NULL,
	"settings" jsonb,
	"canvasState" jsonb,
	"taskLog" jsonb,
	"error" text,
	"pausedAt" timestamp,
	"currentStepId" uuid,
	"totalSteps" integer,
	"completedSteps" integer DEFAULT 0,
	"estimatedCost" jsonb,
	"startedAt" timestamp,
	"completedAt" timestamp,
	"outlineId" uuid,
	"templateId" uuid,
	"projectId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "BookGenerationAsset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"generationId" uuid NOT NULL,
	"assetType" varchar(32) NOT NULL,
	"content" text,
	"imageUrl" text,
	"metadata" jsonb,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "BookGenerationStep" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"generationId" uuid NOT NULL,
	"chapterId" uuid,
	"sequence" integer NOT NULL,
	"stepType" varchar(32) NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"revisionRound" integer DEFAULT 1,
	"agentOutput" text,
	"reviewFeedback" text,
	"wordCount" integer,
	"tokenCount" integer,
	"startedAt" timestamp,
	"completedAt" timestamp,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ChapterVersion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chapterId" uuid NOT NULL,
	"generationId" uuid,
	"content" text NOT NULL,
	"wordCount" integer,
	"version" integer NOT NULL,
	"createdBy" varchar(32) DEFAULT 'ai',
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GenerationNote" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"generationId" uuid NOT NULL,
	"chapterId" uuid,
	"content" text NOT NULL,
	"isGlobal" boolean DEFAULT false NOT NULL,
	"appliedAt" timestamp,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GenerationTemplate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"settings" jsonb NOT NULL,
	"isBuiltIn" boolean DEFAULT false NOT NULL,
	"userId" uuid,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Scene" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"title" text NOT NULL,
	"sequence" integer NOT NULL,
	"content" text,
	"status" varchar(32) DEFAULT 'planned' NOT NULL,
	"chapterId" uuid NOT NULL,
	"projectId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SceneCard" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"purpose" text NOT NULL,
	"setting" text,
	"atmosphere" text,
	"emotionalBeats" jsonb,
	"characterGoals" jsonb,
	"constraints" jsonb,
	"plannedReveal" text,
	"sceneId" uuid NOT NULL,
	"projectId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "StoryState" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"chapterNumber" integer NOT NULL,
	"characterKnowledge" jsonb,
	"characterInjuries" jsonb,
	"relationshipChanges" jsonb,
	"openThreads" jsonb,
	"revealsMade" jsonb,
	"worldStateChanges" jsonb,
	"generationId" uuid NOT NULL,
	"projectId" uuid NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Chat" ADD CONSTRAINT "Chat_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Message_v2" ADD CONSTRAINT "Message_v2_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Stream" ADD CONSTRAINT "Stream_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Vote_v2" ADD CONSTRAINT "Vote_v2_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Vote_v2" ADD CONSTRAINT "Vote_v2_messageId_Message_v2_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."Message_v2"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_documentId_documentCreatedAt_Document_id_createdAt_fk" FOREIGN KEY ("documentId","documentCreatedAt") REFERENCES "public"."Document"("id","createdAt") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SourceMaterial" ADD CONSTRAINT "SourceMaterial_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SourceMaterial" ADD CONSTRAINT "SourceMaterial_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SourceMaterialChapter" ADD CONSTRAINT "SourceMaterialChapter_sourceMaterialId_SourceMaterial_id_fk" FOREIGN KEY ("sourceMaterialId") REFERENCES "public"."SourceMaterial"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SourceMaterialChapter" ADD CONSTRAINT "SourceMaterialChapter_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SourceMaterialChapter" ADD CONSTRAINT "SourceMaterialChapter_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SourceMaterialChunk" ADD CONSTRAINT "SourceMaterialChunk_chapterId_SourceMaterialChapter_id_fk" FOREIGN KEY ("chapterId") REFERENCES "public"."SourceMaterialChapter"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SourceMaterialChunk" ADD CONSTRAINT "SourceMaterialChunk_sourceMaterialId_SourceMaterial_id_fk" FOREIGN KEY ("sourceMaterialId") REFERENCES "public"."SourceMaterial"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SourceMaterialChunk" ADD CONSTRAINT "SourceMaterialChunk_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SourceMaterialChunk" ADD CONSTRAINT "SourceMaterialChunk_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SourceMaterialProcessing" ADD CONSTRAINT "SourceMaterialProcessing_sourceMaterialId_SourceMaterial_id_fk" FOREIGN KEY ("sourceMaterialId") REFERENCES "public"."SourceMaterial"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SourceMaterialProcessing" ADD CONSTRAINT "SourceMaterialProcessing_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SourceMaterialProcessing" ADD CONSTRAINT "SourceMaterialProcessing_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Entity" ADD CONSTRAINT "Entity_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "EntityAttribute" ADD CONSTRAINT "EntityAttribute_entityId_Entity_id_fk" FOREIGN KEY ("entityId") REFERENCES "public"."Entity"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "EntityAttribute" ADD CONSTRAINT "EntityAttribute_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_sourceEntityId_Entity_id_fk" FOREIGN KEY ("sourceEntityId") REFERENCES "public"."Entity"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_targetEntityId_Entity_id_fk" FOREIGN KEY ("targetEntityId") REFERENCES "public"."Entity"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_outlineId_Outline_id_fk" FOREIGN KEY ("outlineId") REFERENCES "public"."Outline"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_volumeId_Volume_id_fk" FOREIGN KEY ("volumeId") REFERENCES "public"."Volume"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ChapterDraft" ADD CONSTRAINT "ChapterDraft_chapterId_Chapter_id_fk" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ChapterDraft" ADD CONSTRAINT "ChapterDraft_volumeId_Volume_id_fk" FOREIGN KEY ("volumeId") REFERENCES "public"."Volume"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ChapterDraft" ADD CONSTRAINT "ChapterDraft_outlineId_Outline_id_fk" FOREIGN KEY ("outlineId") REFERENCES "public"."Outline"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ChapterDraft" ADD CONSTRAINT "ChapterDraft_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Outline" ADD CONSTRAINT "Outline_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Volume" ADD CONSTRAINT "Volume_outlineId_Outline_id_fk" FOREIGN KEY ("outlineId") REFERENCES "public"."Outline"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Volume" ADD CONSTRAINT "Volume_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BookExport" ADD CONSTRAINT "BookExport_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BookExport" ADD CONSTRAINT "BookExport_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BookGeneration" ADD CONSTRAINT "BookGeneration_outlineId_Outline_id_fk" FOREIGN KEY ("outlineId") REFERENCES "public"."Outline"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BookGeneration" ADD CONSTRAINT "BookGeneration_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BookGenerationAsset" ADD CONSTRAINT "BookGenerationAsset_generationId_BookGeneration_id_fk" FOREIGN KEY ("generationId") REFERENCES "public"."BookGeneration"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BookGenerationStep" ADD CONSTRAINT "BookGenerationStep_generationId_BookGeneration_id_fk" FOREIGN KEY ("generationId") REFERENCES "public"."BookGeneration"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BookGenerationStep" ADD CONSTRAINT "BookGenerationStep_chapterId_Chapter_id_fk" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ChapterVersion" ADD CONSTRAINT "ChapterVersion_chapterId_Chapter_id_fk" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ChapterVersion" ADD CONSTRAINT "ChapterVersion_generationId_BookGeneration_id_fk" FOREIGN KEY ("generationId") REFERENCES "public"."BookGeneration"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenerationNote" ADD CONSTRAINT "GenerationNote_generationId_BookGeneration_id_fk" FOREIGN KEY ("generationId") REFERENCES "public"."BookGeneration"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenerationNote" ADD CONSTRAINT "GenerationNote_chapterId_Chapter_id_fk" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenerationTemplate" ADD CONSTRAINT "GenerationTemplate_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Scene" ADD CONSTRAINT "Scene_chapterId_Chapter_id_fk" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Scene" ADD CONSTRAINT "Scene_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SceneCard" ADD CONSTRAINT "SceneCard_sceneId_Scene_id_fk" FOREIGN KEY ("sceneId") REFERENCES "public"."Scene"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SceneCard" ADD CONSTRAINT "SceneCard_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "StoryState" ADD CONSTRAINT "StoryState_generationId_BookGeneration_id_fk" FOREIGN KEY ("generationId") REFERENCES "public"."BookGeneration"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "StoryState" ADD CONSTRAINT "StoryState_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_preferences_user_idx" ON "UserPreferences" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_user_id_created_at_idx" ON "Chat" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_chat_id_created_at_idx" ON "Message_v2" USING btree ("chatId","createdAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "source_material_project_idx" ON "SourceMaterial" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "source_material_user_idx" ON "SourceMaterial" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "source_material_chapter_material_idx" ON "SourceMaterialChapter" USING btree ("sourceMaterialId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "source_material_chapter_project_idx" ON "SourceMaterialChapter" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "source_material_chunk_chapter_idx" ON "SourceMaterialChunk" USING btree ("chapterId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "source_material_chunk_project_idx" ON "SourceMaterialChunk" USING btree ("projectId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "source_material_processing_material_idx" ON "SourceMaterialProcessing" USING btree ("sourceMaterialId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "source_material_processing_project_idx" ON "SourceMaterialProcessing" USING btree ("projectId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "entity_name_project_idx" ON "Entity" USING btree ("projectId","name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "entity_attribute_name_idx" ON "EntityAttribute" USING btree ("entityId","name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "relationship_unique_idx" ON "Relationship" USING btree ("projectId","sourceEntityId","targetEntityId","type");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "chapter_sequence_volume_idx" ON "Chapter" USING btree ("volumeId","sequence");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "book_export_project_idx" ON "BookExport" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "book_export_user_idx" ON "BookExport" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "book_generation_project_idx" ON "BookGeneration" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "book_generation_asset_generation_idx" ON "BookGenerationAsset" USING btree ("generationId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "book_generation_asset_type_idx" ON "BookGenerationAsset" USING btree ("generationId","assetType");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "book_generation_step_generation_idx" ON "BookGenerationStep" USING btree ("generationId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "book_generation_step_sequence_idx" ON "BookGenerationStep" USING btree ("generationId","sequence");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chapter_version_chapter_idx" ON "ChapterVersion" USING btree ("chapterId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chapter_version_version_idx" ON "ChapterVersion" USING btree ("chapterId","version");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "generation_note_generation_idx" ON "GenerationNote" USING btree ("generationId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "generation_note_chapter_idx" ON "GenerationNote" USING btree ("chapterId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "generation_template_user_idx" ON "GenerationTemplate" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "scene_chapter_idx" ON "Scene" USING btree ("chapterId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "scene_sequence_chapter_idx" ON "Scene" USING btree ("chapterId","sequence");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "scene_card_scene_idx" ON "SceneCard" USING btree ("sceneId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "story_state_generation_idx" ON "StoryState" USING btree ("generationId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "story_state_chapter_idx" ON "StoryState" USING btree ("generationId","chapterNumber");