type ResetUser = { email: string; name?: string | null };

/**
 * Sends the password-reset email without blocking the HTTP response (timing / enumeration).
 * Resend HTTP calls stay in this module (adapter-style boundary for `packages/auth`).
 * If `RESEND_API_KEY` is set, uses Resend; otherwise logs the link (dev / staging without provider).
 */
export function queuePasswordResetEmail(user: ResetUser, url: string): void {
  void (async () => {
    try {
      const key = process.env.RESEND_API_KEY;
      const from =
        process.env.RESEND_FROM_EMAIL ?? "Aliko CV <onboarding@resend.dev>";

      if (key) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: user.email,
            subject: "Réinitialiser votre mot de passe — Aliko CV",
            html: `<p>Bonjour${user.name ? ` ${user.name}` : ""},</p>
<p>Pour choisir un nouveau mot de passe, ouvrez ce lien (durée limitée)&nbsp;:</p>
<p><a href="${url}">${url}</a></p>
<p>Si vous n’avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>`,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("[auth] Resend password reset failed:", res.status, text);
        }
      } else {
        console.info(
          "[auth] Password reset link (set RESEND_API_KEY to send real emails):",
          user.email,
          url
        );
      }
    } catch (e) {
      console.error("[auth] queuePasswordResetEmail failed", e);
    }
  })();
}
