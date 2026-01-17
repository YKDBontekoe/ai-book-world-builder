import { verifyRegistrationResponse } from "@simplewebauthn/server";
import type { RegistrationResponseJSON } from "@simplewebauthn/types";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import {
	encodeBase64Url,
	passkeyOrigin,
	passkeyRpId,
	registrationResponseSchema,
} from "@/lib/auth/passkeys";
import {
	createPasskeyCredential,
	deletePasskeyChallenge,
	getPasskeyChallenge,
} from "@/lib/db/queries/passkeys";

const requestSchema = z.object({
	credential: registrationResponseSchema,
});

export async function POST(request: Request) {
	const session = await auth();

	if (!session?.user?.id || !session.user.email) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const { credential } = requestSchema.parse(body);

	const challenge = await getPasskeyChallenge(session.user.id, "registration");
	if (!challenge || challenge.expiresAt < new Date()) {
		return NextResponse.json({ error: "Challenge expired" }, { status: 400 });
	}

	const verification = await verifyRegistrationResponse({
		response: credential as RegistrationResponseJSON,
		expectedChallenge: challenge.challenge,
		expectedOrigin: passkeyOrigin,
		expectedRPID: passkeyRpId,
		requireUserVerification: true,
	});

	if (!verification.verified || !verification.registrationInfo) {
		return NextResponse.json({ error: "Verification failed" }, { status: 400 });
	}

	const {
		credential: { id, publicKey, counter },
	} = verification.registrationInfo;

	await createPasskeyCredential({
		userId: session.user.id,
		credentialId: id,
		publicKey: encodeBase64Url(publicKey),
		counter,
		transports: credential.response.transports ?? [],
	});

	await deletePasskeyChallenge(challenge.id);

	return NextResponse.json({ verified: true });
}
