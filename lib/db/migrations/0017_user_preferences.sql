-- Create UserPreferences table for storing user-specific settings
CREATE TABLE "UserPreferences" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" uuid NOT NULL REFERENCES "User"("id") UNIQUE,
  "favoriteModels" jsonb DEFAULT '[]' NOT NULL,
  "recentModels" jsonb DEFAULT '[]' NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

-- Create index for faster user lookups
CREATE INDEX "user_preferences_user_idx" ON "UserPreferences"("userId");
