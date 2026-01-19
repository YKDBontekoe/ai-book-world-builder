"use client";

import { startRegistration } from "@simplewebauthn/browser";
import type {
	PublicKeyCredentialCreationOptionsJSON,
	RegistrationResponseJSON,
} from "@simplewebauthn/types";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { toast } from "@/components/atoms/toast";

export function PasskeyRegistrationButton() {
	const { data: session } = useSession();
	const [isPasskeySubmitting, setIsPasskeySubmitting] = useState(false);

	const handleCreatePasskey = async () => {
		if (!session?.user?.id) {
			toast({
				type: "error",
				description: "Sign in before creating a passkey.",
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
				"/api/passkeys/registration/options",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
				},
			);

			if (!optionsResponse.ok) {
				const { error } = (await optionsResponse.json()) as { error?: string };
				throw new Error(error ?? "Unable to start passkey setup.");
			}

			const options =
				(await optionsResponse.json()) as PublicKeyCredentialCreationOptionsJSON;

			const credential = (await startRegistration(
				options,
			)) as RegistrationResponseJSON;

			const verifyResponse = await fetch("/api/passkeys/registration/verify", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ credential }),
			});

			if (!verifyResponse.ok) {
				const { error } = (await verifyResponse.json()) as { error?: string };
				throw new Error(error ?? "Passkey verification failed.");
			}

			toast({ type: "success", description: "Passkey saved successfully." });
		} catch (error) {
			toast({
				type: "error",
				description:
					error instanceof Error ? error.message : "Unable to create passkey.",
			});
		} finally {
			setIsPasskeySubmitting(false);
		}
	};

	if (!session?.user?.id) return null;

	return (
		<Button
			className="w-full"
			disabled={isPasskeySubmitting}
			onClick={handleCreatePasskey}
			type="button"
			variant="glass"
		>
			{isPasskeySubmitting ? "Creating passkey..." : "Create a passkey"}
		</Button>
	);
}
