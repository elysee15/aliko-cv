import { db } from "@aliko-cv/db/client";
import {
  getActiveWebhooksForEvent,
  updateWebhookLastTriggered,
} from "@aliko-cv/db/queries";

export type WebhookEvent =
  | "resume.created"
  | "resume.updated"
  | "resume.deleted"
  | "resume.published"
  | "resume.exported"
  | "application.created";

type WebhookPayload = {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
};

async function signPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Fire-and-forget: dispatches webhook events to all matching endpoints.
 * Errors are silently caught to avoid blocking the caller.
 */
export function dispatchWebhook(
  userId: string,
  event: WebhookEvent,
  data: Record<string, unknown>,
) {
  // Run async without blocking the server action
  void (async () => {
    try {
      const hooks = await getActiveWebhooksForEvent(db, userId, event);
      if (hooks.length === 0) return;

      const payload: WebhookPayload = {
        event,
        timestamp: new Date().toISOString(),
        data,
      };
      const body = JSON.stringify(payload);

      await Promise.allSettled(
        hooks.map(async (hook) => {
          const signature = await signPayload(body, hook.secret);

          const res = await fetch(hook.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Aliko-Signature": `sha256=${signature}`,
              "X-Aliko-Event": event,
              "X-Aliko-Delivery": crypto.randomUUID(),
            },
            body,
            signal: AbortSignal.timeout(10_000),
          });

          if (res.ok) {
            await updateWebhookLastTriggered(db, hook.id);
          }
        }),
      );
    } catch {
      // Silently ignore — webhooks must never block the main flow
    }
  })();
}
