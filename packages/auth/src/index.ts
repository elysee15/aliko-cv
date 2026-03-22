import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@aliko-cv/db/client";

import { queuePasswordResetEmail } from "./reset-password-email";
import { queueChangeEmailVerification } from "./change-email-verification";
import { queueEmailVerification } from "./email-verification";

export function initAuth(options: {
  baseUrl: string;
  secret: string | undefined;
  trustedOrigins?: string[];
}) {
  return betterAuth({
    database: drizzleAdapter(db, { provider: "pg" }),
    baseURL: options.baseUrl,
    secret: options.secret,
    trustedOrigins: options.trustedOrigins,
    emailAndPassword: {
      enabled: true,
      /**
       * Better Auth generates a one-time token, persists it (verification table), and builds `url`
       * pointing to `redirectTo` with `?token=…`. The token is invalidated after a successful reset.
       */
      sendResetPassword: async ({ user, url }) => {
        queuePasswordResetEmail(user, url);
      },
      revokeSessionsOnPasswordReset: true,
    },
    user: {
      changeEmail: {
        enabled: true,
        sendChangeEmailConfirmation: async (data) => {
          queueChangeEmailVerification(data.user, data.newEmail, data.url);
        },
      },
    },
    emailVerification: {
      sendVerificationEmail: async (data) => {
        queueEmailVerification(data.user, data.url);
      },
    },
  });
}
