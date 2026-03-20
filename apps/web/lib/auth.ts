import type { Auth } from "better-auth";
import { initAuth } from "@aliko-cv/auth";

const baseUrl =
  process.env.BETTER_AUTH_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
const secret = process.env.BETTER_AUTH_SECRET;

export const auth = initAuth({
  baseUrl,
  secret,
  trustedOrigins: ["http://localhost:3000", "http://localhost:3001"],
}) as Auth;
