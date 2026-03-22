"use client";

import { useState } from "react";
import type { SubmitErrorHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import { authClient } from "@/lib/auth-client";
import {
  changePasswordSchema,
  signUpPasswordRules,
  type ChangePasswordInput,
} from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";

export function ChangePasswordForm() {
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
    reset,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onInvalid: SubmitErrorHandler<ChangePasswordInput> = (formErrors) => {
    const order: (keyof ChangePasswordInput)[] = [
      "currentPassword",
      "newPassword",
      "confirmPassword",
    ];
    const first = order.find((k) => formErrors[k]);
    if (first) void setFocus(first);
  };

  async function onSubmit(values: ChangePasswordInput) {
    setGlobalError(null);

    try {
      const { error } = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        setGlobalError(
          "Mot de passe actuel incorrect ou modification impossible.",
        );
        return;
      }

      toast.success("Mot de passe modifié !");
      reset();
    } catch {
      setGlobalError("Erreur réseau. Réessayez.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mot de passe</CardTitle>
        <CardDescription>
          Modifiez votre mot de passe. Les autres sessions seront déconnectées.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="space-y-4"
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
            <Field data-invalid={!!errors.currentPassword}>
              <FieldLabel htmlFor="change-pw-current">
                Mot de passe actuel{" "}
                <span className="text-destructive" aria-hidden>
                  *
                </span>
              </FieldLabel>
              <Input
                id="change-pw-current"
                type="password"
                autoComplete="current-password"
                aria-required="true"
                aria-invalid={!!errors.currentPassword}
                aria-describedby={
                  errors.currentPassword
                    ? "change-pw-current-error"
                    : undefined
                }
                className={
                  errors.currentPassword ? "border-destructive" : undefined
                }
                disabled={isSubmitting}
                {...register("currentPassword")}
              />
              {errors.currentPassword ? (
                <FieldError id="change-pw-current-error">
                  {errors.currentPassword.message}
                </FieldError>
              ) : null}
            </Field>

            <Field data-invalid={!!errors.newPassword}>
              <FieldLabel htmlFor="change-pw-new">
                Nouveau mot de passe{" "}
                <span className="text-destructive" aria-hidden>
                  *
                </span>
              </FieldLabel>
              <Input
                id="change-pw-new"
                type="password"
                autoComplete="new-password"
                aria-required="true"
                aria-invalid={!!errors.newPassword}
                aria-describedby={
                  errors.newPassword
                    ? "change-pw-new-error change-pw-new-hint"
                    : "change-pw-new-hint"
                }
                className={
                  errors.newPassword ? "border-destructive" : undefined
                }
                disabled={isSubmitting}
                {...register("newPassword")}
              />
              <FieldDescription id="change-pw-new-hint">
                {signUpPasswordRules.description}
              </FieldDescription>
              {errors.newPassword ? (
                <FieldError id="change-pw-new-error">
                  {errors.newPassword.message}
                </FieldError>
              ) : null}
            </Field>

            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="change-pw-confirm">
                Confirmer le nouveau mot de passe{" "}
                <span className="text-destructive" aria-hidden>
                  *
                </span>
              </FieldLabel>
              <Input
                id="change-pw-confirm"
                type="password"
                autoComplete="new-password"
                aria-required="true"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword
                    ? "change-pw-confirm-error"
                    : undefined
                }
                className={
                  errors.confirmPassword ? "border-destructive" : undefined
                }
                disabled={isSubmitting}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword ? (
                <FieldError id="change-pw-confirm-error">
                  {errors.confirmPassword.message}
                </FieldError>
              ) : null}
            </Field>
          </FieldGroup>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Modification…" : "Modifier le mot de passe"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
