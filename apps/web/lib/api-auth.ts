import { NextResponse } from "next/server";

import { db } from "@aliko-cv/db/client";
import { validateApiKey } from "@aliko-cv/db/queries";

type ApiKeyResult = { userId: string; scope: "read" | "read_write" };

export async function authenticateApiKey(
  request: Request,
): Promise<ApiKeyResult | NextResponse> {
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

  const result = await validateApiKey(db, rawKey);

  if (!result) {
    return NextResponse.json(
      { error: "Invalid or revoked API key" },
      { status: 401 },
    );
  }

  return result;
}

export async function authenticateApiKeyWrite(
  request: Request,
): Promise<{ userId: string } | NextResponse> {
  const result = await authenticateApiKey(request);
  if (result instanceof NextResponse) return result;

  if (result.scope !== "read_write") {
    return NextResponse.json(
      { error: "This API key does not have write permissions. Create a key with read_write scope." },
      { status: 403 },
    );
  }

  return result;
}
