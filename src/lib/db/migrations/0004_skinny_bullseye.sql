CREATE TABLE "TimelineBranch" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"projectId" uuid NOT NULL,
	"parentBranchId" uuid,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TimelineNode" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branchId" uuid NOT NULL,
	"projectId" uuid NOT NULL,
	"type" varchar NOT NULL,
	"originalSceneId" uuid,
	"content" text,
	"summary" text,
	"parentNodeId" uuid,
	"depth" integer DEFAULT 0,
	"order" integer DEFAULT 0,
	"data" jsonb,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "TimelineBranch" ADD CONSTRAINT "TimelineBranch_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TimelineNode" ADD CONSTRAINT "TimelineNode_branchId_TimelineBranch_id_fk" FOREIGN KEY ("branchId") REFERENCES "public"."TimelineBranch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TimelineNode" ADD CONSTRAINT "TimelineNode_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TimelineNode" ADD CONSTRAINT "TimelineNode_originalSceneId_Scene_id_fk" FOREIGN KEY ("originalSceneId") REFERENCES "public"."Scene"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "timeline_branch_project_idx" ON "TimelineBranch" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "timeline_branch_parent_branch_idx" ON "TimelineBranch" USING btree ("parentBranchId");--> statement-breakpoint
CREATE INDEX "timeline_node_branch_idx" ON "TimelineNode" USING btree ("branchId");--> statement-breakpoint
CREATE INDEX "timeline_node_project_idx" ON "TimelineNode" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "timeline_node_original_scene_idx" ON "TimelineNode" USING btree ("originalSceneId");--> statement-breakpoint
CREATE INDEX "timeline_node_parent_node_idx" ON "TimelineNode" USING btree ("parentNodeId");