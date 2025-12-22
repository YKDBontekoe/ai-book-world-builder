CREATE TABLE "ConsistencyIssue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectId" uuid NOT NULL,
	"sceneId" uuid,
	"type" varchar(32) NOT NULL,
	"description" text NOT NULL,
	"suggestion" text,
	"severity" varchar(32) DEFAULT 'medium' NOT NULL,
	"status" varchar(32) DEFAULT 'open' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ConsistencyIssue" ADD CONSTRAINT "ConsistencyIssue_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ConsistencyIssue" ADD CONSTRAINT "ConsistencyIssue_sceneId_Scene_id_fk" FOREIGN KEY ("sceneId") REFERENCES "public"."Scene"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "issue_project_idx" ON "ConsistencyIssue" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "issue_scene_idx" ON "ConsistencyIssue" USING btree ("sceneId");