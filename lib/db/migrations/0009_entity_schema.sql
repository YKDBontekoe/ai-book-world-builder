CREATE TABLE IF NOT EXISTS "Entity" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp NOT NULL,
    "name" text NOT NULL,
    "kind" varchar NOT NULL,
    "summary" text,
    "startDate" timestamp,
    "endDate" timestamp,
    "projectId" uuid NOT NULL,
    CONSTRAINT "Entity_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "Project"("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "entity_name_project_idx" ON "Entity" ("projectId", "name");

CREATE TABLE IF NOT EXISTS "EntityAttribute" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "createdAt" timestamp NOT NULL,
    "name" text NOT NULL,
    "value" text NOT NULL,
    "dataType" varchar NOT NULL,
    "startDate" timestamp,
    "endDate" timestamp,
    "entityId" uuid NOT NULL,
    "projectId" uuid NOT NULL,
    CONSTRAINT "EntityAttribute_entityId_Entity_id_fk" FOREIGN KEY ("entityId") REFERENCES "Entity"("id"),
    CONSTRAINT "EntityAttribute_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "Project"("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "entity_attribute_name_idx" ON "EntityAttribute" ("entityId", "name");

CREATE TABLE IF NOT EXISTS "Relationship" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "createdAt" timestamp NOT NULL,
    "type" varchar NOT NULL,
    "description" text,
    "startDate" timestamp,
    "endDate" timestamp,
    "projectId" uuid NOT NULL,
    "sourceEntityId" uuid NOT NULL,
    "targetEntityId" uuid NOT NULL,
    CONSTRAINT "Relationship_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "Project"("id"),
    CONSTRAINT "Relationship_sourceEntityId_Entity_id_fk" FOREIGN KEY ("sourceEntityId") REFERENCES "Entity"("id"),
    CONSTRAINT "Relationship_targetEntityId_Entity_id_fk" FOREIGN KEY ("targetEntityId") REFERENCES "Entity"("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "relationship_unique_idx" ON "Relationship" ("projectId", "sourceEntityId", "targetEntityId", "type");
