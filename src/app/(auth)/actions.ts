"use server";

import { z } from "zod";
import { signIn } from "@/app/(auth)/auth";
import { createUser } from "@/lib/db/queries";

const authFormSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

export type LoginActionState = {
	status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
};

export const login = async (
	_: LoginActionState,
	formData: FormData,
): Promise<LoginActionState> => {
	// Add delay to prevent timing attacks and brute force
	await new Promise((resolve) => setTimeout(resolve, 500));

	try {
		const validatedData = authFormSchema.parse({
			email: formData.get("email"),
			password: formData.get("password"),
		});

		const result = await signIn("credentials", {
			email: validatedData.email,
			password: validatedData.password,
			redirect: false,
		});

		// Check for error in return value (when redirect: false)
		if (result?.error) {
			return { status: "failed" };
		}

		return { status: "success" };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return { status: "invalid_data" };
		}

		return { status: "failed" };
	}
};

export type RegisterActionState = {
	status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
};

export const register = async (
	_: RegisterActionState,
	formData: FormData,
): Promise<RegisterActionState> => {
	// Add delay to prevent timing attacks and brute force
	await new Promise((resolve) => setTimeout(resolve, 500));

	try {
		const validatedData = authFormSchema.parse({
			email: formData.get("email"),
			password: formData.get("password"),
		});

		// We do not check if user exists to prevent enumeration.
		// If the user exists, createUser will throw (unique constraint),
		// and we return "failed".

		await createUser(validatedData.email, validatedData.password);

		const result = await signIn("credentials", {
			email: validatedData.email,
			password: validatedData.password,
			redirect: false,
		});

		if (result?.error) {
			return { status: "failed" };
		}

		return { status: "success" };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return { status: "invalid_data" };
		}

		return { status: "failed" };
	}
};
