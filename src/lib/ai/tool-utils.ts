import { tool } from "ai";
import type { Session } from "next-auth";
import type { z } from "zod";

interface CreateProtectedToolOptions<T extends z.ZodType> {
	description: string;
	inputSchema: T;
	execute: (
		args: z.infer<T>,
		context: { session: Session; projectId?: string },
	) => Promise<unknown>;
	requireProjectId?: boolean;
}

/**
 * Creates an AI tool with built-in authentication and error handling.
 */
export function createProtectedTool<T extends z.ZodType>({
	description,
	inputSchema,
	execute,
	requireProjectId = true,
}: CreateProtectedToolOptions<T>) {
	return ({
		session,
		projectId: globalProjectId,
	}: {
		session: Session | null;
		projectId?: string;
	}) =>
		tool({
			description,
			parameters: inputSchema,
			// @ts-expect-error - execute return type is unknown but tool expects structured result
			execute: async (args: z.infer<T>) => {
				if (!session?.user) {
					return { error: "Authentication required." };
				}

				// Resolve projectId: arguments take precedence over global context
				// @ts-ignore - Check if projectId exists in args
				const projectId = args.projectId || globalProjectId;

				if (requireProjectId && !projectId) {
					return { error: "Project ID is required." };
				}

				try {
					return await execute(args, { session, projectId });
				} catch (error) {
					console.error(`Tool execution failed (${description}):`, error);
					return {
						error:
							error instanceof Error
								? error.message
								: "An unexpected error occurred.",
					};
				}
			},
		});
}
