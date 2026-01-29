import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import type { AuthenticationResponseJSON } from "@simplewebauthn/types";
import { compare } from "bcrypt-ts";
import { eq } from "drizzle-orm";
import NextAuth, { type DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authConfig } from "@/app/(auth)/auth.config";
import {
	authenticationResponseSchema,
	decodeBase64Url,
	passkeyOrigin,
	passkeyRpId,
} from "@/lib/auth/passkeys";
import { DUMMY_PASSWORD } from "@/lib/constants";
import { db } from "@/lib/db";
import {
	deletePasskeyChallenge,
	getPasskeyChallenge,
	getPasskeyCredentialByCredentialId,
	updatePasskeyCredentialCounter,
} from "@/lib/db/queries/passkeys";
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
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
				passkeyCredential: { label: "Passkey Credential", type: "text" },
			},
			async authorize(credentials) {
				const email = credentials?.email;

				if (!email) {
					return null;
				}

				if (credentials.passkeyCredential) {
					const users = await getUser(email);

					if (users.length === 0) {
						return null;
					}

					const [user] = users;

					if (user.bannedAt) {
						return null;
					}

					let parsedJson: unknown;
					try {
						parsedJson = JSON.parse(credentials.passkeyCredential);
					} catch {
						return null;
					}

					const parsedCredential =
						authenticationResponseSchema.safeParse(parsedJson);

					if (!parsedCredential.success) {
						return null;
					}

					const passkeyCredential =
						parsedCredential.data as AuthenticationResponseJSON;

					const storedCredential = await getPasskeyCredentialByCredentialId(
						passkeyCredential.id,
					);

					if (!storedCredential || storedCredential.userId !== user.id) {
						return null;
					}

					const challenge = await getPasskeyChallenge(
						user.id,
						"authentication",
					);

					if (!challenge || challenge.expiresAt < new Date()) {
						return null;
					}

					const verification = await verifyAuthenticationResponse({
						response: passkeyCredential,
						expectedChallenge: challenge.challenge,
						expectedOrigin: passkeyOrigin,
						expectedRPID: passkeyRpId,
						requireUserVerification: true,
						authenticator: {
							credentialID: decodeBase64Url(storedCredential.credentialId),
							credentialPublicKey: decodeBase64Url(storedCredential.publicKey),
							counter: storedCredential.counter,
							transports: storedCredential.transports ?? undefined,
						},
					});

					if (!verification.verified) {
						return null;
					}

					await updatePasskeyCredentialCounter(
						storedCredential.id,
						verification.authenticationInfo.newCounter,
					);
					await deletePasskeyChallenge(challenge.id);

					return { ...user, type: "regular", role: user.role };
				}

				const password = credentials.password;

				if (!password) {
					return null;
				}

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
				if ("bannedAt" in user && user.bannedAt) return false;

				// Double check DB if strictly needed, but for perf let's rely on adapter or basic flow.
				// Actually, for Google login, the user is created/fetched by adapter.
				// Let's rely on jwt callback to reject? No, signIn is better to stop it early.

				const existingUsers = await getUser(user.email);
				if (existingUsers.length > 0 && existingUsers[0].bannedAt) {
					return false;
				}

				// Handle Admin Promotion on Login (Once)
				if (
					user.email === process.env.ADMIN_EMAIL &&
					user.role !== "admin"
				) {
					try {
						await db
							.update(userTable)
							.set({ role: "admin" })
							.where(eq(userTable.email, user.email));
						// Update local user object so it propagates to JWT
						user.role = "admin";
					} catch (error) {
						console.error("Failed to promote admin user", error);
					}
				}
			}
			return true;
		},
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id as string;
				token.type = "regular";
				token.role = user.role || "user";
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
