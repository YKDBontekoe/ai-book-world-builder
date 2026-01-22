import type { NextAuthConfig } from "next-auth";

export const authConfig = {
	pages: {
		signIn: "/login",
		newUser: "/platform",
	},
	providers: [
		// added later in auth.ts since it requires bcrypt which is only compatible with Node.js
		// while this file is also used in non-Node.js environments
	],
	callbacks: {
		authorized({ auth, request: { nextUrl } }) {
			const isLoggedIn = !!auth?.user;

			const isOnLogin = nextUrl.pathname.startsWith("/login");
			const isOnRegister = nextUrl.pathname.startsWith("/register");
			const isPing = nextUrl.pathname.startsWith("/ping");

			if (isPing) return true;

			if (isOnLogin || isOnRegister) {
				if (isLoggedIn) {
					return Response.redirect(new URL("/", nextUrl));
				}
				return true;
			}

			if (!isLoggedIn) {
				if (nextUrl.pathname === "/") {
					return true;
				}
				return false;
			}

			return isLoggedIn;
		},
	},
} satisfies NextAuthConfig;
