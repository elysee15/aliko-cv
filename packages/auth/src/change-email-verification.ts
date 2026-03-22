import { env } from "./env";
import { escapeHtml } from "./utils";

type VerificationUser = { email: string; name?: string | null };

/**
 * Sends an email-change verification email without blocking the HTTP response.
 * If `RESEND_API_KEY` is set, uses Resend; otherwise logs the link (dev / staging).
 */
export function queueChangeEmailVerification(
  user: VerificationUser,
  newEmail: string,
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
        const safeNewEmail = escapeHtml(newEmail);

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: newEmail,
            subject: "Vérifiez votre nouvelle adresse email — Aliko CV",
            html: `<p>${greeting},</p>
<p>Vous avez demandé à changer votre adresse email vers <strong>${safeNewEmail}</strong>.</p>
<p>Pour confirmer ce changement, ouvrez ce lien&nbsp;:</p>
<p><a href="${safeUrl}">${safeUrl}</a></p>
<p>Si vous n'avez pas fait cette demande, vous pouvez ignorer cet email.</p>`,
            text: `${greeting},\n\nVous avez demandé à changer votre adresse email vers ${newEmail}.\n\nPour confirmer ce changement, ouvrez ce lien :\n${url}\n\nSi vous n'avez pas fait cette demande, vous pouvez ignorer cet email.`,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error(
            "[auth] Resend change email verification failed:",
            res.status,
            text,
          );
        }
      } else {
        console.info(
          "[auth] Change email verification link (set RESEND_API_KEY to send real emails):",
          newEmail,
          url,
        );
      }
    } catch (e) {
      console.error("[auth] queueChangeEmailVerification failed", e);
    }
  })();
}
