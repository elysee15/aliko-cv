"use client";

import { useState } from "react";
import type { SubmitErrorHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { Button } from "@workspace/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { authClient } from "@/lib/auth-client";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";

const GENERIC_SUCCESS =
  "Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.";

export function ForgotPasswordForm() {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onInvalid: SubmitErrorHandler<ForgotPasswordInput> = (formErrors) => {
    if (formErrors.email) void setFocus("email");
  };

  async function onSubmit(values: ForgotPasswordInput) {
    setGlobalError(null);
    setSucceeded(false);

    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await authClient.requestPasswordReset({
        email: values.email,
        redirectTo,
      });

      if (error) {
        console.error("error when requesting password reset", error);
        setGlobalError(
          "Impossible de traiter la demande pour le moment. Réessayez plus tard."
        );
      } else {
        setSucceeded(true);
      }
    } catch {
      setGlobalError(
        "Impossible de traiter la demande pour le moment. Réessayez plus tard."
      );
    }
  }

  if (succeeded) {
    return (
      <div
        role="status"
        className="rounded-md border border-green-600/30 bg-green-600/10 px-3 py-2 text-sm text-green-800 dark:text-green-200"
      >
        {GENERIC_SUCCESS}
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
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="forgot-email">
            Email <span className="text-destructive" aria-hidden>*</span>
          </FieldLabel>
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            required
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "forgot-email-error" : undefined}
            className={errors.email ? "border-destructive" : undefined}
            disabled={isSubmitting}
            {...register("email")}
          />
          {errors.email ? (
            <FieldError id="forgot-email-error">{errors.email.message}</FieldError>
          ) : null}
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Envoi…" : "Envoyer le lien de réinitialisation"}
      </Button>
    </form>
  );
}
