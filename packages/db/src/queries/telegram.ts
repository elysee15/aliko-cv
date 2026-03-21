import { eq, and, gt } from "drizzle-orm";

import type { Database } from "../client";
import { telegramLink, telegramLinkToken } from "../telegram-schema";

// ---------------------------------------------------------------------------
// Link tokens (one-time, expires in 10 min)
// ---------------------------------------------------------------------------

export async function createTelegramLinkToken(
  db: Database,
  userId: string,
): Promise<string> {
  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.insert(telegramLinkToken).values({ userId, token, expiresAt });
  return token;
}

export async function consumeTelegramLinkToken(
  db: Database,
  token: string,
): Promise<string | null> {
  const row = await db.query.telegramLinkToken.findFirst({
    where: and(
      eq(telegramLinkToken.token, token),
      gt(telegramLinkToken.expiresAt, new Date()),
    ),
  });

  if (!row) return null;

  await db
    .delete(telegramLinkToken)
    .where(eq(telegramLinkToken.id, row.id));

  return row.userId;
}

// ---------------------------------------------------------------------------
// Telegram link CRUD
// ---------------------------------------------------------------------------

export async function linkTelegram(
  db: Database,
  userId: string,
  chatId: number,
  username?: string,
) {
  const existing = await db.query.telegramLink.findFirst({
    where: eq(telegramLink.userId, userId),
  });

  if (existing) {
    const [row] = await db
      .update(telegramLink)
      .set({ chatId, username, linkedAt: new Date() })
      .where(eq(telegramLink.userId, userId))
      .returning();
    return row;
  }

  const [row] = await db
    .insert(telegramLink)
    .values({ userId, chatId, username })
    .returning();
  return row;
}

export async function getTelegramLinkByUser(db: Database, userId: string) {
  return db.query.telegramLink.findFirst({
    where: eq(telegramLink.userId, userId),
  });
}

export async function getTelegramLinkByChatId(db: Database, chatId: number) {
  return db.query.telegramLink.findFirst({
    where: eq(telegramLink.chatId, chatId),
  });
}

export async function unlinkTelegram(db: Database, userId: string) {
  const [row] = await db
    .delete(telegramLink)
    .where(eq(telegramLink.userId, userId))
    .returning();
  return row;
}
