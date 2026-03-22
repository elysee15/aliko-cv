"use client";

import { useState } from "react";
import type { SubmitErrorHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import { authClient } from "@/lib/auth-client";
import { changeEmailSchema, type ChangeEmailInput } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";

type Props = {
  email: string;
};

export function ChangeEmailForm({ email }: Props) {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
    getValues,
  } = useForm<ChangeEmailInput>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: email },
  });

  const onInvalid: SubmitErrorHandler<ChangeEmailInput> = (formErrors) => {
    if (formErrors.newEmail) void setFocus("newEmail");
  };

  async function onSubmit(values: ChangeEmailInput) {
    setGlobalError(null);
    setSucceeded(false);

    if (values.newEmail === email) {
      setGlobalError("La nouvelle adresse est identique à l'adresse actuelle.");
      return;
    }

    try {
      const callbackURL = `${window.location.origin}/dashboard/settings`;
      const { error } = await authClient.changeEmail({
        newEmail: values.newEmail,
        callbackURL,
      });

      if (error) {
        setGlobalError(
          "Impossible de changer l'email. Vérifiez que l'adresse n'est pas déjà utilisée.",
        );
        return;
      }

      setSucceeded(true);
    } catch {
      setGlobalError("Erreur réseau. Réessayez.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adresse email</CardTitle>
        <CardDescription>
          Changez votre adresse email. Un email de vérification sera envoyé à la
          nouvelle adresse.
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

          {succeeded ? (
            <div
              role="status"
              className="rounded-md border border-green-600/30 bg-green-600/10 px-3 py-2 text-sm text-green-800 dark:text-green-200"
            >
              Un email de vérification a été envoyé à{" "}
              <strong>{getValues("newEmail")}</strong>. Votre email sera mis à
              jour après vérification.
            </div>
          ) : null}

          <FieldGroup className="gap-4">
            <Field data-invalid={!!errors.newEmail}>
              <FieldLabel htmlFor="change-email">
                Nouvel email{" "}
                <span className="text-destructive" aria-hidden>
                  *
                </span>
              </FieldLabel>
              <Input
                id="change-email"
                type="email"
                autoComplete="email"
                aria-required="true"
                aria-invalid={!!errors.newEmail}
                aria-describedby={
                  errors.newEmail ? "change-email-error" : undefined
                }
                className={errors.newEmail ? "border-destructive" : undefined}
                disabled={isSubmitting}
                {...register("newEmail")}
              />
              {errors.newEmail ? (
                <FieldError id="change-email-error">
                  {errors.newEmail.message}
                </FieldError>
              ) : null}
            </Field>
          </FieldGroup>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Envoi…" : "Mettre à jour l'email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
