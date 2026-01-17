import "server-only";
import { z } from "zod";

const appUrl =
	process.env.NEXT_PUBLIC_APP_URL ??
	process.env.NEXTAUTH_URL ??
	(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
	"http://localhost:3000";

const parsedUrl = new URL(appUrl);

export const passkeyRpId = parsedUrl.hostname;
export const passkeyOrigin = parsedUrl.origin;

export const passkeyEmailSchema = z.object({
	email: z.string().email(),
});

export const registrationResponseSchema = z
	.object({
		id: z.string(),
		rawId: z.string(),
		type: z.literal("public-key"),
		response: z.object({
			clientDataJSON: z.string(),
			attestationObject: z.string(),
			transports: z.array(z.string()).optional(),
		}),
		clientExtensionResults: z.record(z.unknown()).optional(),
	})
	.passthrough();

export const authenticationResponseSchema = z
	.object({
		id: z.string(),
		rawId: z.string(),
		type: z.literal("public-key"),
		response: z.object({
			clientDataJSON: z.string(),
			authenticatorData: z.string(),
			signature: z.string(),
			userHandle: z.string().nullable().optional(),
		}),
		clientExtensionResults: z.record(z.unknown()).optional(),
	})
	.passthrough();

export const encodeBase64Url = (value: Uint8Array): string =>
	Buffer.from(value).toString("base64url");

export const decodeBase64Url = (value: string): Uint8Array =>
	Uint8Array.from(Buffer.from(value, "base64url"));
