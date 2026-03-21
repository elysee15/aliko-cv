import { env } from "../env";

const BASE = "https://api.telegram.org/bot";

function getToken(): string {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  return token;
}

export async function sendTelegramMessage(
  chatId: number,
  text: string,
  parseMode: "Markdown" | "HTML" = "Markdown",
) {
  const token = getToken();
  const res = await fetch(`${BASE}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
    }),
  });
  return res.json();
}

export async function setTelegramWebhook(webhookUrl: string) {
  const token = getToken();
  const res = await fetch(`${BASE}${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: webhookUrl }),
  });
  return res.json();
}

export function isTelegramConfigured(): boolean {
  return !!env.TELEGRAM_BOT_TOKEN;
}
