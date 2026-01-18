import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
	decodeBase64Url,
	passkeyEmailSchema,
	passkeyRpId,
} from "@/lib/auth/passkeys";
import {
	createPasskeyChallenge,
	listPasskeyCredentialsByUserId,
} from "@/lib/db/queries/passkeys";
import { getUser } from "@/lib/db/queries/user";

export async function POST(request: Request) {
	const session = await auth();
	const body = await request.json();
	const { email } = passkeyEmailSchema.parse(body);

	if (session?.user?.email && session.user.email !== email) {
		return NextResponse.json(
			{ error: "Email mismatch for active session" },
			{ status: 403 },
		);
	}

	const users = await getUser(email);
	if (users.length === 0) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	const [user] = users;

	const credentials = await listPasskeyCredentialsByUserId(user.id);
	if (credentials.length === 0) {
		return NextResponse.json(
			{ error: "No passkeys available" },
			{ status: 404 },
		);
	}

	const options = generateAuthenticationOptions({
		rpID: passkeyRpId,
		userVerification: "preferred",
		allowCredentials: credentials.map((credential) => ({
			id: decodeBase64Url(credential.credentialId),
			type: "public-key",
			transports: credential.transports ?? undefined,
		})),
	});

	await createPasskeyChallenge(
		user.id,
		"authentication",
		options.challenge,
		new Date(Date.now() + 5 * 60 * 1000),
	);

	return NextResponse.json(options);
}
