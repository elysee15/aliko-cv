"use server";

import { revalidatePath } from "next/cache";

import { db } from "@aliko-cv/db/client";
import { upsertPortfolio } from "@aliko-cv/db/queries";

import { authClient } from "@/lib/safe-action";
import { updatePortfolioSchema } from "@/lib/schemas/portfolio";

export const updatePortfolioAction = authClient
  .inputSchema(updatePortfolioSchema)
  .action(async ({ parsedInput, ctx }) => {
    const portfolio = await upsertPortfolio(db, ctx.user.id, parsedInput);
    revalidatePath("/dashboard/settings/portfolio");
    return portfolio;
  });
