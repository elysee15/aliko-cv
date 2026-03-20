"use client";

import { createAuthClient } from "better-auth/client";

/**
 * Better Auth client (vanilla `better-auth/client` — same RPC as React helper; add `better-auth/react` when you need `useSession`).
 * @see https://better-auth.com/docs/integrations/nextjs
 * @see https://better-auth.com/docs/basic-usage
 */
function resolveBaseURL(): string {
  if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL) {
    return process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: resolveBaseURL(),
});
