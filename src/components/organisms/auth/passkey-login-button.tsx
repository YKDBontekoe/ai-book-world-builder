"use client";

import { startAuthentication } from "@simplewebauthn/browser";
import type {
	AuthenticationResponseJSON,
	PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/types";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { toast } from "@/components/atoms/toast";

interface PasskeyLoginButtonProps {
	email: string;
}

export function PasskeyLoginButton({ email }: PasskeyLoginButtonProps) {
	const router = useRouter();
	const { update: updateSession } = useSession();
	const [isPasskeySubmitting, setIsPasskeySubmitting] = useState(false);

	const handlePasskeySignIn = async () => {
		if (!email) {
			toast({
				type: "error",
				description: "Enter your email to use a passkey.",
			});
			return;
		}

		if (!window.PublicKeyCredential) {
			toast({
				type: "error",
				description: "Passkeys are not supported on this device.",
			});
			return;
		}

		setIsPasskeySubmitting(true);

		try {
			const optionsResponse = await fetch(
				"/api/passkeys/authentication/options",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email }),
				},
			);

			if (!optionsResponse.ok) {
				const { error } = (await optionsResponse.json()) as { error?: string };
				throw new Error(error ?? "Unable to start passkey login.");
			}

			const options =
				(await optionsResponse.json()) as PublicKeyCredentialRequestOptionsJSON;
			const credential = (await startAuthentication(
				options,
			)) as AuthenticationResponseJSON;

			const result = await signIn("credentials", {
				email,
				passkeyCredential: JSON.stringify(credential),
				redirect: false,
			});

			if (result?.error) {
				throw new Error("Passkey verification failed.");
			}

			await updateSession();
			router.refresh();
		} catch (error) {
			toast({
				type: "error",
				description:
					error instanceof Error
						? error.message
						: "Unable to sign in with passkey.",
			});
		} finally {
			setIsPasskeySubmitting(false);
		}
	};

	return (
		<Button
			className="w-full"
			disabled={isPasskeySubmitting}
			onClick={handlePasskeySignIn}
			type="button"
			variant="glass"
		>
			{isPasskeySubmitting ? "Waiting for passkey..." : "Use a passkey"}
		</Button>
	);
}
