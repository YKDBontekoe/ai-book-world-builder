import type { UserRole } from "@/lib/db/schema/auth";

export const isAdmin = (role?: UserRole | string | null) => {
	return role === "admin";
};
