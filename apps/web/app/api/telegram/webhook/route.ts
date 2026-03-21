import { NextResponse } from "next/server";

import { db } from "@aliko-cv/db/client";
import {
  consumeTelegramLinkToken,
  linkTelegram,
  getTelegramLinkByChatId,
  getResumesByUser,
  getResumeById,
  createEntry,
  createSection,
} from "@aliko-cv/db/queries";
import { sendTelegramMessage, isTelegramConfigured } from "@/lib/telegram";

// ---------------------------------------------------------------------------
// Telegram Update type (minimal subset)
// ---------------------------------------------------------------------------

type TelegramUpdate = {
  message?: {
    chat: { id: number };
    from?: { username?: string; first_name?: string };
    text?: string;
  };
};

// ---------------------------------------------------------------------------
// Command handlers
// ---------------------------------------------------------------------------

const HELP_TEXT = `
*Commandes disponibles :*

/start <token> — Lier votre compte Aliko CV
/list — Lister vos CV
/add <cv\\_id> skill <nom> — Ajouter une compétence
/add <cv\\_id> experience <titre> chez <entreprise> — Ajouter une expérience
/add <cv\\_id> language <nom> — Ajouter une langue
/help — Afficher cette aide
`.trim();

async function handleStart(chatId: number, args: string, username?: string) {
  const token = args.trim();
  if (!token) {
    await sendTelegramMessage(
      chatId,
      "Bienvenue ! Envoyez `/start <token>` avec le token généré depuis les paramètres d'Aliko CV.",
    );
    return;
  }

  const userId = await consumeTelegramLinkToken(db, token);
  if (!userId) {
    await sendTelegramMessage(chatId, "Token invalide ou expiré. Générez-en un nouveau depuis les paramètres.");
    return;
  }

  await linkTelegram(db, userId, chatId, username);
  await sendTelegramMessage(chatId, "Compte lié avec succès ! Envoyez /help pour voir les commandes.");
}

async function handleList(chatId: number) {
  const link = await getTelegramLinkByChatId(db, chatId);
  if (!link) {
    await sendTelegramMessage(chatId, "Compte non lié. Utilisez /start <token> d'abord.");
    return;
  }

  const resumes = await getResumesByUser(db, link.userId);
  if (resumes.length === 0) {
    await sendTelegramMessage(chatId, "Aucun CV trouvé. Créez-en un sur la plateforme web.");
    return;
  }

  const lines = resumes.map(
    (r, i) => `${i + 1}. *${r.title}* (${r.status})\n   ID: \`${r.id}\``,
  );
  await sendTelegramMessage(chatId, `*Vos CV :*\n\n${lines.join("\n\n")}`);
}

async function handleAdd(chatId: number, args: string) {
  const link = await getTelegramLinkByChatId(db, chatId);
  if (!link) {
    await sendTelegramMessage(chatId, "Compte non lié. Utilisez /start <token> d'abord.");
    return;
  }

  // Parse: /add <cv_id> <type> <rest>
  const parts = args.trim().split(/\s+/);
  if (parts.length < 3) {
    await sendTelegramMessage(
      chatId,
      "Format : `/add <cv_id> skill React` ou `/add <cv_id> experience Dev chez Google`",
    );
    return;
  }

  const cvId = parts[0]!;
  const type = parts[1]!.toLowerCase();
  const rest = parts.slice(2).join(" ");

  const resume = await getResumeById(db, cvId, link.userId);
  if (!resume) {
    await sendTelegramMessage(chatId, "CV introuvable. Vérifiez l'ID avec /list.");
    return;
  }

  if (type === "skill") {
    const section = resume.sections.find((s) => s.type === "skills");
    if (section) {
      await createEntry(db, {
        sectionId: section.id,
        title: rest,
        sortOrder: section.entries.length,
      });
    } else {
      const newSection = await createSection(db, {
        resumeId: cvId,
        type: "skills",
        title: "Compétences",
        sortOrder: resume.sections.length,
      });
      await createEntry(db, {
        sectionId: newSection!.id,
        title: rest,
        sortOrder: 0,
      });
    }
    await sendTelegramMessage(chatId, `Compétence *${rest}* ajoutée à "${resume.title}".`);
    return;
  }

  if (type === "language" || type === "langue") {
    const section = resume.sections.find((s) => s.type === "languages");
    if (section) {
      await createEntry(db, {
        sectionId: section.id,
        title: rest,
        sortOrder: section.entries.length,
      });
    } else {
      const newSection = await createSection(db, {
        resumeId: cvId,
        type: "languages",
        title: "Langues",
        sortOrder: resume.sections.length,
      });
      await createEntry(db, {
        sectionId: newSection!.id,
        title: rest,
        sortOrder: 0,
      });
    }
    await sendTelegramMessage(chatId, `Langue *${rest}* ajoutée à "${resume.title}".`);
    return;
  }

  if (type === "experience" || type === "exp") {
    const chezMatch = rest.match(/^(.+?)\s+chez\s+(.+)$/i);
    const title = chezMatch ? chezMatch[1]!.trim() : rest;
    const org = chezMatch ? chezMatch[2]!.trim() : undefined;

    const section = resume.sections.find((s) => s.type === "experience");
    if (section) {
      await createEntry(db, {
        sectionId: section.id,
        title,
        organization: org,
        current: true,
        sortOrder: section.entries.length,
      });
    } else {
      const newSection = await createSection(db, {
        resumeId: cvId,
        type: "experience",
        title: "Expérience",
        sortOrder: resume.sections.length,
      });
      await createEntry(db, {
        sectionId: newSection!.id,
        title,
        organization: org,
        current: true,
        sortOrder: 0,
      });
    }
    const msg = org
      ? `Expérience *${title}* chez *${org}* ajoutée à "${resume.title}".`
      : `Expérience *${title}* ajoutée à "${resume.title}".`;
    await sendTelegramMessage(chatId, msg);
    return;
  }

  await sendTelegramMessage(
    chatId,
    `Type inconnu : \`${type}\`. Essayez : skill, experience, language.`,
  );
}

async function handleHelp(chatId: number) {
  await sendTelegramMessage(chatId, HELP_TEXT);
}

// ---------------------------------------------------------------------------
// Webhook handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  if (!isTelegramConfigured()) {
    return NextResponse.json({ ok: true });
  }

  let update: TelegramUpdate;
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = update.message;
  if (!message?.text) return NextResponse.json({ ok: true });

  const chatId = message.chat.id;
  const text = message.text.trim();
  const username = message.from?.username;

  try {
    if (text.startsWith("/start")) {
      await handleStart(chatId, text.slice(6), username);
    } else if (text === "/list") {
      await handleList(chatId);
    } else if (text.startsWith("/add")) {
      await handleAdd(chatId, text.slice(4));
    } else if (text === "/help") {
      await handleHelp(chatId);
    } else {
      await sendTelegramMessage(
        chatId,
        "Commande non reconnue. Envoyez /help pour voir les commandes.",
      );
    }
  } catch (err) {
    console.error("Telegram webhook error:", err);
    await sendTelegramMessage(chatId, "Une erreur est survenue. Réessayez.");
  }

  return NextResponse.json({ ok: true });
}
