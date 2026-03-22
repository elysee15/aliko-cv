import { escapeHtml } from "./utils";
import { queueEmail } from "./mailer";

type ResetUser = { email: string; name?: string | null };

export function queuePasswordResetEmail(user: ResetUser, url: string): void {
  const name = user.name?.trim().replace(/[\r\n\t]/g, " ") || "";
  const htmlGreeting = name ? `Bonjour ${escapeHtml(name)}` : "Bonjour";
  const textGreeting = name ? `Bonjour ${name}` : "Bonjour";
  const safeUrl = escapeHtml(url);

  queueEmail({
    to: user.email,
    subject: "Réinitialiser votre mot de passe — Aliko CV",
    html: `<p>${htmlGreeting},</p>
<p>Pour choisir un nouveau mot de passe, ouvrez ce lien (durée limitée)&nbsp;:</p>
<p><a href="${safeUrl}">${safeUrl}</a></p>
<p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>`,
    text: `${textGreeting},\n\nPour choisir un nouveau mot de passe, ouvrez ce lien (durée limitée) :\n${url}\n\nSi vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.`,
  });
}
