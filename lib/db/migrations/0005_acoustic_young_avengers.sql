ALTER TABLE "Scene" ADD COLUMN "prevSceneId" uuid;--> statement-breakpoint
CREATE INDEX "scene_prev_scene_idx" ON "Scene" USING btree ("prevSceneId");