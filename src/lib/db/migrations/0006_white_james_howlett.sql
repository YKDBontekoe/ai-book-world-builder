ALTER TABLE "UserPreferences" ADD COLUMN "modelPreferences" jsonb DEFAULT '{"light":null,"middle":null,"large":null}'::jsonb;
