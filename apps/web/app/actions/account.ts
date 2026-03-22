"use server";

import { db } from "@aliko-cv/db/client";
import { deleteUserAccount } from "@aliko-cv/db/queries";

import { authClient, ActionError } from "@/lib/safe-action";
import { deleteAccountSchema } from "@/lib/schemas/account";

export const deleteAccountAction = authClient
  .inputSchema(deleteAccountSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (parsedInput.confirmEmail !== ctx.user.email) {
      throw new ActionError("L'email de confirmation ne correspond pas.");
    }
    await deleteUserAccount(db, ctx.user.id);
    return null;
  });
