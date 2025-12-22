import NextAuth from "next-auth";
import { authConfig } from "@/app/(auth)/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Exclude verification-settings from middleware to allow UI testing without login
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|verification-settings).*)"],
};
