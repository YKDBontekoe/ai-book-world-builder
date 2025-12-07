ALTER TABLE "BookGeneration" DROP COLUMN IF EXISTS "currentStage";
ALTER TABLE "BookGeneration" DROP COLUMN IF EXISTS "stageProgress";
ALTER TABLE "BookGeneration" ADD COLUMN "canvasState" jsonb;
ALTER TABLE "BookGeneration" ADD COLUMN "taskLog" jsonb;
