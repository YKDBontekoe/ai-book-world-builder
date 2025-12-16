import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthRedirect />
    </Suspense>
  );
}

async function AuthRedirect() {
  const session = await auth();

  if (session) {
    redirect("/projects");
  }

  redirect("/login");

  // This is unreachable but satisfies TS return type for async component if needed,
  // though typically `redirect` throws.
  return null;
}
