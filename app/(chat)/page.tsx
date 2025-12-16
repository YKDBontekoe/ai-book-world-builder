import { redirect } from "next/navigation";
import { auth } from "../(auth)/auth";

export default async function Page() {
  const session = await auth();

  if (session) {
    redirect("/projects");
  }

  // If not authenticated, the middleware or layout usually handles it,
  // but if we land here unauthenticated, we can show a landing page or redirect to login.
  // For now, let's redirect to login.
  redirect("/login");
}
