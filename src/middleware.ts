import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	const response = NextResponse.next();

	// Security Headers
	const headers = response.headers;

	// Prevent clickjacking
	headers.set("X-Frame-Options", "DENY");

	// Prevent MIME type sniffing
	headers.set("X-Content-Type-Options", "nosniff");

	// Control referrer information
	headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

	// Force HTTPS (HSTS) - 1 year
	if (process.env.NODE_ENV === "production") {
		headers.set(
			"Strict-Transport-Security",
			"max-age=31536000; includeSubDomains; preload",
		);
	}

	// Basic Content Security Policy
	// Note: A strict CSP often requires significant tuning for a complex app (scripts, styles, etc.)
	// Starting with frame-ancestors to reinforce X-Frame-Options.
	// We avoid a full CSP here to prevent breaking the app without extensive testing of all external scripts (Analytics, etc.)
	headers.set("Content-Security-Policy", "frame-ancestors 'none';");

	headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

	return response;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};
