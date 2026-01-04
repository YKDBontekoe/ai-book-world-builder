import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { compare } from "bcrypt-ts";
import { eq } from "drizzle-orm";
import NextAuth, { type DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authConfig } from "@/app/(auth)/auth.config";
import { DUMMY_PASSWORD } from "@/lib/constants";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries/user";
import { account, user as userTable } from "@/lib/db/schema";
import type { UserRole } from "@/lib/db/schema/auth";

export type UserType = "regular";

declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
			type: UserType;
			role: UserRole;
		} & DefaultSession["user"];
	}

	// biome-ignore lint/style/useConsistentTypeDefinitions: "Required for interface merging"
	interface User {
		id?: string;
		email?: string | null;
		type: UserType;
		role: UserRole;
	}
}

declare module "next-auth/jwt" {
	interface JWT extends DefaultJWT {
		id: string;
		type: UserType;
		role: UserRole;
	}
}

export const {
	handlers: { GET, POST },
	auth,
	signIn,
	signOut,
} = NextAuth({
	...authConfig,
	adapter: DrizzleAdapter(db, {
		usersTable: userTable,
		accountsTable: account,
	}),
	session: {
		strategy: "jwt",
	},
	providers: [
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			allowDangerousEmailAccountLinking: true,
			authorization: {
				params: {
					prompt: "consent",
					access_type: "offline",
					response_type: "code",
				},
			},
		}),
		Credentials({
			credentials: {},
			async authorize({ email, password }: any) {
				const users = await getUser(email);

				if (users.length === 0) {
					await compare(password, DUMMY_PASSWORD);
					return null;
				}

				const [user] = users;

				// Ban Check
				if (user.bannedAt) {
					return null;
				}

				if (!user.password) {
					await compare(password, DUMMY_PASSWORD);
					return null;
				}

				const passwordsMatch = await compare(password, user.password);

				if (!passwordsMatch) {
					return null;
				}

				return { ...user, type: "regular", role: user.role };
			},
		}),
	],
	callbacks: {
		async signIn({ user }) {
			// Check ban status for OAuth providers
			// For Credentials, authorize() handles it, but safe to double check or if user comes from Adapter
			if (user.email) {
				// We need to fetch the user from DB to check bannedAt because 'user' object here might be from provider
				// However, DrizzleAdapter should return the DB user if it exists.
				// But NextAuth types are tricky. Let's do a quick query to be safe if 'bannedAt' isn't on the user object yet.
				// Since we modified schema, 'user' might have it if adapter fetched it.
				// To be safe, let's cast or check property.
				const dbUser = user as any;
				if (dbUser.bannedAt) return false;

				// Double check DB if strictly needed, but for perf let's rely on adapter or basic flow.
				// Actually, for Google login, the user is created/fetched by adapter.
				// Let's rely on jwt callback to reject? No, signIn is better to stop it early.

				const existingUsers = await getUser(user.email);
				if (existingUsers.length > 0 && existingUsers[0].bannedAt) {
					return false;
				}
			}
			return true;
		},
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id as string;
				token.type = "regular";

				// Handle Admin Promotion on Login
				let role = user.role;
				if (
					user.email &&
					user.email === process.env.ADMIN_EMAIL &&
					role !== "admin"
				) {
					try {
						await db
							.update(userTable)
							.set({ role: "admin" })
							.where(eq(userTable.email, user.email));
						role = "admin";
					} catch (error) {
						console.error("Failed to promote admin user", error);
					}
				}
				token.role = role || "user";
			}

			return token;
		},
		session({ session, token }) {
			if (session.user) {
				session.user.id = token.id;
				session.user.type = token.type;
				session.user.role = token.role;
			}

			return session;
		},
	},
});
