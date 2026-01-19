ALTER TABLE "UserPreferences"
ADD COLUMN "julesPreferences" jsonb
DEFAULT '{"repository":null,"branch":null}'::jsonb;--> statement-breakpoint
