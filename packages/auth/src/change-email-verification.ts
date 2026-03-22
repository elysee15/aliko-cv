import { escapeHtml } from "./utils";
import { queueEmail } from "./mailer";

type VerificationUser = { email: string; name?: string | null };

export function queueChangeEmailVerification(
  user: VerificationUser,
  newEmail: string,
  url: string,
): void {
  const name = user.name?.trim().replace(/[\r\n\t]/g, " ") || "";
  const htmlGreeting = name ? `Bonjour ${escapeHtml(name)}` : "Bonjour";
  const textGreeting = name ? `Bonjour ${name}` : "Bonjour";
  const safeUrl = escapeHtml(url);
  const safeNewEmail = escapeHtml(newEmail);

  queueEmail({
    to: newEmail,
    subject: "Vérifiez votre nouvelle adresse email — Aliko CV",
    html: `<p>${htmlGreeting},</p>
<p>Vous avez demandé à changer votre adresse email vers <strong>${safeNewEmail}</strong>.</p>
<p>Pour confirmer ce changement, ouvrez ce lien&nbsp;:</p>
<p><a href="${safeUrl}">${safeUrl}</a></p>
<p>Si vous n'avez pas fait cette demande, vous pouvez ignorer cet email.</p>`,
    text: `${textGreeting},\n\nVous avez demandé à changer votre adresse email vers ${newEmail}.\n\nPour confirmer ce changement, ouvrez ce lien :\n${url}\n\nSi vous n'avez pas fait cette demande, vous pouvez ignorer cet email.`,
  });
}
