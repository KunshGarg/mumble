import { auth } from "@clerk/nextjs/server";

/**
 * Check if the current user is an admin
 * Returns the userId if admin, throws error if not
 */
export async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: No user logged in");
  }

  const adminUserIds = process.env.ADMIN_USER_IDS?.split(",").map((id) =>
    id.trim()
  );

  if (!adminUserIds || !adminUserIds.includes(userId)) {
    throw new Error("Unauthorized: User is not an admin");
  }

  return userId;
}

/**
 * Check if a user ID is an admin (for client-side checks)
 */
export function isAdmin(userId: string | null | undefined): boolean {
  if (!userId) return false;

  const adminUserIds = process.env.ADMIN_USER_IDS?.split(",").map((id) =>
    id.trim()
  );

  return adminUserIds?.includes(userId) || false;
}
