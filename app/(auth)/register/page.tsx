"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";
import { GoogleSignInButton } from "@/components/auth/google-button";
import { AuthForm } from "@/components/auth/auth-form";
import { SubmitButton } from "@/components/submit-button";
import { toast } from "@/components/ui/toast";
import { type RegisterActionState, register } from "../actions";

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    {
      status: "idle",
    }
  );

  const { update: updateSession } = useSession();

  // biome-ignore lint/correctness/useExhaustiveDependencies: router and updateSession are stable refs
  useEffect(() => {
    if (state.status === "user_exists") {
      toast({ type: "error", description: "Account already exists!" });
    } else if (state.status === "failed") {
      toast({ type: "error", description: "Failed to create account!" });
    } else if (state.status === "invalid_data") {
      toast({
        type: "error",
        description: "Failed validating your submission!",
      });
    } else if (state.status === "success") {
      toast({ type: "success", description: "Account created successfully!" });

      setIsSuccessful(true);
      updateSession();
      router.refresh();
    }
  }, [state.status]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  return (
    <div className="flex h-dvh w-screen items-start justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 pt-12 md:items-center md:pt-0 dark:from-zinc-950 dark:via-zinc-900 dark:to-violet-950">
      <div className="flex w-full max-w-md flex-col gap-8 overflow-hidden rounded-2xl border border-zinc-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-900/80">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <h3 className="font-semibold text-2xl text-zinc-900 dark:text-zinc-50">
            Create Account
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Start building your story universe today
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <GoogleSignInButton mode="signup" />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-zinc-300 border-t dark:border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                Or continue with email
              </span>
            </div>
          </div>

          <AuthForm action={handleSubmit} defaultEmail={email}>
            <SubmitButton isSuccessful={isSuccessful}>Sign Up</SubmitButton>
          </AuthForm>
        </div>

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          {"Already have an account? "}
          <Link
            className="font-semibold text-violet-600 hover:underline dark:text-violet-400"
            href="/login"
          >
            Sign in
          </Link>
          {" instead."}
        </p>
      </div>
    </div>
  );
}
