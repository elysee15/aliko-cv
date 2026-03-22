import { z } from "zod";

export const deleteAccountSchema = z.object({
  confirmEmail: z.string().email("E-mail invalide"),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
