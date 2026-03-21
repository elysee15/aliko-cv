import { eq } from "drizzle-orm";

import type { Database } from "../client";
import { user } from "../auth-schema";

export async function deleteUserAccount(db: Database, userId: string) {
  const [row] = await db.delete(user).where(eq(user.id, userId)).returning();
  return row;
}
