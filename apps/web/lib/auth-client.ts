"use client";

import { createAuthClient } from "better-auth/client";

import { env } from "../env";

function resolveBaseURL(): string {
  if (env.NEXT_PUBLIC_BETTER_AUTH_URL) {
    return env.NEXT_PUBLIC_BETTER_AUTH_URL;
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: resolveBaseURL(),
});
