import { type HttpHandler, HttpResponse, http } from "msw";

/**
 * Standard MSW handlers for the application.
 * Array of HTTP handlers for use in the mock server.
 */
export const handlers: HttpHandler[] = [
	// Example handler
	http.get("https://api.example.com/user", () => {
		return HttpResponse.json({ name: "John Maverick" });
	}),

	// Handler for AI suggestions
	http.post("*/api/ai-suggestions", () => {
		return HttpResponse.json({
			suggestions: [
				{
					label: "Mocked Suggestion",
					prompt: "This is a mocked suggestion",
					type: "story",
					reasoning: "Mocked reasoning",
				},
			],
		});
	}),

	// Handler for GitHub avatars
	http.get("https://github.com/*", () => {
		return new HttpResponse(null, { status: 200 });
	}),
];
