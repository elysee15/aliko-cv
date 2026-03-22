import { env } from "./env";
import { escapeHtml } from "./utils";

type VerificationUser = { email: string; name?: string | null };

/**
 * Sends a generic email-verification link without blocking the HTTP response.
 * Used for initial account verification and any non-change-email confirmation.
 */
export function queueEmailVerification(
  user: VerificationUser,
  url: string,
): void {
  void (async () => {
    try {
      const key = env.RESEND_API_KEY;
      const from =
        env.RESEND_FROM_EMAIL ?? "Aliko CV <onboarding@resend.dev>";

      if (key) {
        const safeName = user.name ? escapeHtml(user.name) : "";
        const greeting = safeName ? `Bonjour ${safeName}` : "Bonjour";
        const safeUrl = escapeHtml(url);

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: user.email,
            subject: "Vérifiez votre adresse email — Aliko CV",
            html: `<p>${greeting},</p>
<p>Pour vérifier votre adresse email, ouvrez ce lien&nbsp;:</p>
<p><a href="${safeUrl}">${safeUrl}</a></p>
<p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>`,
            text: `${greeting},\n\nPour vérifier votre adresse email, ouvrez ce lien :\n${url}\n\nSi vous n'avez pas créé de compte, vous pouvez ignorer cet email.`,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error(
            "[auth] Resend email verification failed:",
            res.status,
            text,
          );
        }
      } else {
        console.info(
          "[auth] Email verification link (set RESEND_API_KEY to send real emails):",
          user.email,
          url,
        );
      }
    } catch (e) {
      console.error("[auth] queueEmailVerification failed", e);
    }
  })();
}
