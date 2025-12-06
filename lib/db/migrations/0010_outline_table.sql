CREATE TABLE IF NOT EXISTS "Outline" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp NOT NULL,
    "title" text NOT NULL,
    "summary" text,
    "pov" varchar NOT NULL,
    "tone" varchar NOT NULL,
    "pacing" varchar NOT NULL,
    "beats" jsonb,
    "projectId" uuid NOT NULL,
    CONSTRAINT "Outline_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "Project"("id")
);
