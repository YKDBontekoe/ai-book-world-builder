CREATE TABLE IF NOT EXISTS "Project" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "createdAt" timestamp NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "visibility" varchar NOT NULL DEFAULT 'private',
  "folders" jsonb NOT NULL,
  "userId" uuid NOT NULL,
  CONSTRAINT "Project_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id")
);
