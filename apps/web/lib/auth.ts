import { initAuth } from "@aliko-cv/auth";

import { env } from "../env";

const baseUrl =
  env.BETTER_AUTH_URL ??
  (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : "http://localhost:3000");

export const auth = initAuth({
  baseUrl,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: ["http://localhost:3000", "http://localhost:3001"],
});
