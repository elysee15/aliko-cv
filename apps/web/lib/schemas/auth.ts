import { z } from "zod";

const passwordMinLength = 8;
const passwordMaxLength = 128;

export const signUpSchema = z.strictObject({
  name: z.string().min(1, "Le nom est requis").max(200),
  email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
  password: z
    .string()
    .min(passwordMinLength, `Le mot de passe doit contenir au moins ${passwordMinLength} caractères`)
    .max(passwordMaxLength, `Le mot de passe ne doit pas dépasser ${passwordMaxLength} caractères`)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
    ),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signUpPasswordRules = {
  minLength: passwordMinLength,
  maxLength: passwordMaxLength,
  description:
    "Au moins 8 caractères, une majuscule, une minuscule et un chiffre.",
} as const;

// Sign-in: email + password only (no complexity rules on login).
export const signInSchema = z.strictObject({
  email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.strictObject({
  email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

const resetPasswordField = z
  .string()
  .min(passwordMinLength, `Le mot de passe doit contenir au moins ${passwordMinLength} caractères`)
  .max(passwordMaxLength, `Le mot de passe ne doit pas dépasser ${passwordMaxLength} caractères`)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
  );

export const resetPasswordSchema = z
  .strictObject({
    password: resetPasswordField,
    confirmPassword: z.string().min(1, "Confirmez le mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
