import { Resend } from "resend";
import { env } from "./env";

type EmailParams = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

let _resend: Resend | null | undefined;

function getResend(): Resend | null {
  if (_resend === undefined) {
    _resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
  }
  return _resend;
}

/** @internal Reset the cached Resend client (for tests). */
export function _resetResend(): void {
  _resend = undefined;
}

const SANDBOX_FROM = "Aliko CV <onboarding@resend.dev>";

/**
 * Enqueues an email without blocking the caller (fire-and-forget).
 * Uses Resend SDK when RESEND_API_KEY is set; falls back to console.info for dev.
 */
export function queueEmail(params: EmailParams): void {
  void (async () => {
    try {
      const resend = getResend();

      if (!resend) {
        console.info(
          "[auth] Email (set RESEND_API_KEY to send):",
          params.to,
          params.subject,
          "\n",
          params.text,
        );
        return;
      }

      const from = env.RESEND_FROM_EMAIL ?? SANDBOX_FROM;

      if (from === SANDBOX_FROM) {
        console.warn(
          "[auth] RESEND_FROM_EMAIL is not set — using Resend sandbox address.",
          "Emails may fail SPF/DKIM in production. Set RESEND_FROM_EMAIL to a verified domain.",
        );
      }

      const { error } = await resend.emails.send({
        from,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
      });

      if (error) {
        console.error("[auth] Resend failed:", error.name, error.message);
      }
    } catch (e) {
      console.error("[auth] queueEmail network failure", e);
    }
  })();
}
