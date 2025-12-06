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
    "userId" uuid NOT NULL,
    CONSTRAINT "SourceMaterial_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "Project"("id"),
    CONSTRAINT "SourceMaterial_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id")
);

CREATE INDEX IF NOT EXISTS "source_material_project_idx" ON "SourceMaterial" ("projectId");
CREATE INDEX IF NOT EXISTS "source_material_user_idx" ON "SourceMaterial" ("userId");
