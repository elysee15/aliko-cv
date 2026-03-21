import { NextResponse } from "next/server";

import { db } from "@aliko-cv/db/client";
import { validateApiKey } from "@aliko-cv/db/queries";

/**
 * Extracts a Bearer token from the Authorization header,
 * validates it as an API key, and returns the userId.
 * Returns a NextResponse error if authentication fails.
 */
export async function authenticateApiKey(
  request: Request,
): Promise<{ userId: string } | NextResponse> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header. Use: Bearer <api_key>" },
      { status: 401 },
    );
  }

  const rawKey = authHeader.slice(7);

  if (!rawKey.startsWith("ak_")) {
    return NextResponse.json(
      { error: "Invalid API key format" },
      { status: 401 },
    );
  }

  const userId = await validateApiKey(db, rawKey);

  if (!userId) {
    return NextResponse.json(
      { error: "Invalid or revoked API key" },
      { status: 401 },
    );
  }

  return { userId };
}
