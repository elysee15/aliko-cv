"use client";

import { useState } from "react";
import Link from "next/link";
import type { SubmitErrorHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { Button, buttonVariants } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { authClient } from "@/lib/auth-client";
import {
  resetPasswordSchema,
  signUpPasswordRules,
  type ResetPasswordInput,
} from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onInvalid: SubmitErrorHandler<ResetPasswordInput> = (formErrors) => {
    const order: (keyof ResetPasswordInput)[] = ["password", "confirmPassword"];
    const first = order.find((k) => formErrors[k]);
    if (first) void setFocus(first);
  };

  async function onSubmit(values: ResetPasswordInput) {
    setGlobalError(null);

    try {
      const { error } = await authClient.resetPassword({
        token,
        newPassword: values.password,
      });

      if (error) {
        setGlobalError(
          "Réinitialisation impossible. Le lien est peut-être expiré — demandez-en un nouveau."
        );
        return;
      }

      setSucceeded(true);
    } catch {
      setGlobalError("Erreur réseau. Réessayez.");
    }
  }

  if (succeeded) {
    return (
      <div className="flex flex-col gap-4">
        <div
          role="status"
          className="rounded-md border border-green-600/30 bg-green-600/10 px-3 py-2 text-sm text-green-800 dark:text-green-200"
        >
          Votre mot de passe a été mis à jour. Vous pouvez vous connecter avec le nouveau mot de
          passe.
        </div>
        <Link
          href="/sign-in"
          className={cn(buttonVariants(), "inline-flex w-full")}
        >
          Aller à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="flex flex-col gap-4"
      noValidate
    >
      {globalError ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {globalError}
        </div>
      ) : null}

      <FieldGroup className="gap-4">
        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="reset-password">
            Nouveau mot de passe <span className="text-destructive" aria-hidden>*</span>
          </FieldLabel>
          <Input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            aria-required="true"
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password
                ? "reset-password-error reset-password-hint"
                : "reset-password-hint"
            }
            className={errors.password ? "border-destructive" : undefined}
            disabled={isSubmitting}
            {...register("password")}
          />
          <FieldDescription id="reset-password-hint">
            {signUpPasswordRules.description}
          </FieldDescription>
          {errors.password ? (
            <FieldError id="reset-password-error">{errors.password.message}</FieldError>
          ) : null}
        </Field>

        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="reset-password-confirm">
            Confirmer le mot de passe <span className="text-destructive" aria-hidden>*</span>
          </FieldLabel>
          <Input
            id="reset-password-confirm"
            type="password"
            autoComplete="new-password"
            aria-required="true"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={
              errors.confirmPassword ? "reset-password-confirm-error" : undefined
            }
            className={errors.confirmPassword ? "border-destructive" : undefined}
            disabled={isSubmitting}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword ? (
            <FieldError id="reset-password-confirm-error">
              {errors.confirmPassword.message}
            </FieldError>
          ) : null}
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Mise à jour…" : "Changer le mot de passe"}
      </Button>
    </form>
  );
}
