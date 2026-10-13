import "server-only";
import { headers } from "next/headers";
import { checkAdminAuth } from "./admin-auth";

/**
 * For admin server actions and route handlers. proxy.ts already guards /admin,
 * but actions are callable endpoints, so each one checks again.
 */
export async function requireAdmin(): Promise<void> {
  if (checkAdminAuth((await headers()).get("authorization")) !== "ok") throw new Error("Not authorised");
}
