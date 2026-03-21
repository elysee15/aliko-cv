import { and, eq } from "drizzle-orm";

import type { Database } from "../client";
import { webhook } from "../webhook-schema";

export type CreateWebhookParams = {
  userId: string;
  url: string;
  secret: string;
  events: string[];
};

export async function getWebhooksByUser(db: Database, userId: string) {
  return db.select().from(webhook).where(eq(webhook.userId, userId));
}

export async function getActiveWebhooksForEvent(
  db: Database,
  userId: string,
  event: string,
) {
  const hooks = await db
    .select()
    .from(webhook)
    .where(and(eq(webhook.userId, userId), eq(webhook.active, true)));

  return hooks.filter((h) => h.events.includes(event));
}

export async function createWebhook(
  db: Database,
  params: CreateWebhookParams,
) {
  const rows = await db
    .insert(webhook)
    .values({
      userId: params.userId,
      url: params.url,
      secret: params.secret,
      events: params.events,
    })
    .returning();
  return rows[0]!;
}

export async function deleteWebhook(
  db: Database,
  id: string,
  userId: string,
) {
  const rows = await db
    .delete(webhook)
    .where(and(eq(webhook.id, id), eq(webhook.userId, userId)))
    .returning();
  return rows[0] ?? null;
}

export async function toggleWebhook(
  db: Database,
  id: string,
  userId: string,
  active: boolean,
) {
  const rows = await db
    .update(webhook)
    .set({ active })
    .where(and(eq(webhook.id, id), eq(webhook.userId, userId)))
    .returning();
  return rows[0] ?? null;
}

export async function updateWebhookLastTriggered(db: Database, id: string) {
  await db
    .update(webhook)
    .set({ lastTriggeredAt: new Date() })
    .where(eq(webhook.id, id));
}
