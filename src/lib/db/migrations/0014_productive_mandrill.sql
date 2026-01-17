CREATE TABLE "PasskeyChallenge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"type" varchar(24) NOT NULL,
	"challenge" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PasskeyCredential" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"credentialId" text NOT NULL,
	"publicKey" text NOT NULL,
	"counter" integer DEFAULT 0 NOT NULL,
	"transports" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"createdAt" timestamp NOT NULL,
	CONSTRAINT "PasskeyCredential_credentialId_unique" UNIQUE("credentialId")
);
--> statement-breakpoint
ALTER TABLE "SceneCard" ADD COLUMN "chronologicalSequence" integer;--> statement-breakpoint
ALTER TABLE "SceneCard" ADD COLUMN "timeSetting" text;--> statement-breakpoint
ALTER TABLE "PasskeyChallenge" ADD CONSTRAINT "PasskeyChallenge_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PasskeyCredential" ADD CONSTRAINT "PasskeyCredential_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "passkey_challenge_user_idx" ON "PasskeyChallenge" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "passkey_challenge_type_idx" ON "PasskeyChallenge" USING btree ("type");--> statement-breakpoint
CREATE INDEX "passkey_credential_user_idx" ON "PasskeyCredential" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "passkey_credential_id_idx" ON "PasskeyCredential" USING btree ("credentialId");--> statement-breakpoint
CREATE INDEX "scene_project_idx" ON "Scene" USING btree ("projectId");