import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isDevelopmentEnvironment } from "./lib/constants";

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	/*
	 * Playwright starts the dev server and requires a 200 status to
	 * begin the tests, so this ensures that the tests can start
	 */
	if (pathname.startsWith("/ping")) {
		return new Response("pong", { status: 200 });
	}

	if (pathname.startsWith("/api/auth")) {
		return NextResponse.next();
	}

	const token = await getToken({
		req: request,
		secret: process.env.AUTH_SECRET,
		secureCookie: !isDevelopmentEnvironment,
	});

	const isPublicRoute = ["/onboarding", "/login", "/register"].includes(
		pathname,
	);
	const isRoot = pathname === "/";

	// Unauthenticated users
	if (!token) {
		if (isRoot) {
			return NextResponse.redirect(new URL("/onboarding", request.url));
		}
		// Allow access to other routes (onboarding, login, register, etc. subject to matcher)
		// Note: The checker mostly matches everything, so we rely on this fallthrough for public routes.
		return NextResponse.next();
	}

	// Authenticated users
	if (isPublicRoute) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/",
		"/chat/:id",
		"/api/:path*",
		"/login",
		"/register",

		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico, sitemap.xml, robots.txt (metadata files)
		 */
		"/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};
