import { escapeHtml } from "./utils";
import { queueEmail } from "./mailer";

type VerificationUser = { email: string; name?: string | null };

export function queueEmailVerification(
  user: VerificationUser,
  url: string,
): void {
  const name = user.name?.trim().replace(/[\r\n\t]/g, " ") || "";
  const htmlGreeting = name ? `Bonjour ${escapeHtml(name)}` : "Bonjour";
  const textGreeting = name ? `Bonjour ${name}` : "Bonjour";
  const safeUrl = escapeHtml(url);

  queueEmail({
    to: user.email,
    subject: "Vérifiez votre adresse email — Aliko CV",
    html: `<p>${htmlGreeting},</p>
<p>Pour vérifier votre adresse email, ouvrez ce lien&nbsp;:</p>
<p><a href="${safeUrl}">${safeUrl}</a></p>
<p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>`,
    text: `${textGreeting},\n\nPour vérifier votre adresse email, ouvrez ce lien :\n${url}\n\nSi vous n'avez pas créé de compte, vous pouvez ignorer cet email.`,
  });
}
