ALTER TABLE "BookGeneration" DROP COLUMN IF EXISTS "currentStage";
ALTER TABLE "BookGeneration" DROP COLUMN IF EXISTS "stageProgress";
ALTER TABLE "BookGeneration" ADD COLUMN IF NOT EXISTS "canvasState" jsonb;
ALTER TABLE "BookGeneration" ADD COLUMN IF NOT EXISTS "taskLog" jsonb;
