import { generateRegistrationOptions } from "@simplewebauthn/server";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/types";
import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { passkeyRpId } from "@/lib/auth/passkeys";
import {
	createPasskeyChallenge,
	listPasskeyCredentialsByUserId,
} from "@/lib/db/queries/passkeys";

export async function POST() {
	const session = await auth();

	if (!session?.user?.id || !session.user.email) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const credentials = await listPasskeyCredentialsByUserId(session.user.id);

	const options = await generateRegistrationOptions({
		rpID: passkeyRpId,
		rpName: "AI Book World Builder",
		userID: new TextEncoder().encode(session.user.id),
		userName: session.user.email,
		userDisplayName: session.user.email,
		attestationType: "none",
		excludeCredentials: credentials.map((credential) => ({
			id: credential.credentialId,
			type: "public-key",
			transports:
				(credential.transports as AuthenticatorTransportFuture[]) ?? undefined,
		})),
	});

	await createPasskeyChallenge(
		session.user.id,
		"registration",
		options.challenge,
		new Date(Date.now() + 5 * 60 * 1000),
	);

	return NextResponse.json(options);
}
