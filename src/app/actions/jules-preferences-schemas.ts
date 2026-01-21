import { z } from "zod";

export const julesPreferencesSchema = z.object({
	repository: z.string().min(1).nullable(),
	branch: z.string().min(1).nullable(),
});
