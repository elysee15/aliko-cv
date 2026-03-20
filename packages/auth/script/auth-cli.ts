/**
 * Better Auth CLI configuration.
 * Used only by: pnpx @better-auth/cli generate --config script/auth-cli.ts --output ../db/src/auth-schema.ts
 * Do not import this file in the application.
 */

import { initAuth } from "../src/index.js";

export const auth = initAuth({
  baseUrl: "http://localhost:3000",
  secret: "cli-secret-placeholder",
});
