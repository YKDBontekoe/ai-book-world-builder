CREATE TABLE "VoiceProfile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"entityId" uuid NOT NULL,
	"vocabularyLevel" varchar(50) NOT NULL,
	"sentenceStyle" varchar(50) NOT NULL,
	"averageSentenceLength" real NOT NULL,
	"catchphrases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"speechMannerisms" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"avoidedWords" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"defaultTone" varchar(100) NOT NULL,
	"emotionalRange" jsonb NOT NULL,
	"sampleDialogue" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"dialect" text,
	"confidence" real NOT NULL
);
--> statement-breakpoint
ALTER TABLE "VoiceProfile" ADD CONSTRAINT "VoiceProfile_entityId_Entity_id_fk" FOREIGN KEY ("entityId") REFERENCES "public"."Entity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "voice_profile_entity_idx" ON "VoiceProfile" USING btree ("entityId");