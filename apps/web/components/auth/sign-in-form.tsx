"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { signInSchema, type SignInInput } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";

const CREDENTIALS_ERROR_MESSAGE =
  "Email ou mot de passe incorrect. Réessayez ou réinitialisez votre mot de passe.";

export function SignInForm() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignInInput>({
     resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignInInput) {
    setGlobalError(null);

    try {
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: `${window.location.origin}/dashboard`,
      });

      if (error) {
        setGlobalError(CREDENTIALS_ERROR_MESSAGE);
        setError("email", { message: CREDENTIALS_ERROR_MESSAGE });
        setError("password", { message: CREDENTIALS_ERROR_MESSAGE });
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setGlobalError("Erreur réseau. Réessayez.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
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
          <FieldLabel htmlFor="email">
            Email <span className="text-destructive" aria-hidden>*</span>
          </FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={errors.email ? "border-destructive" : undefined}
            disabled={isSubmitting}
            {...register("email")}
          />
          {errors.email ? (
            <FieldError id="email-error">{errors.email.message}</FieldError>
          ) : null}
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">
            Mot de passe <span className="text-destructive" aria-hidden>*</span>
          </FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            aria-required="true"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            className={errors.password ? "border-destructive" : undefined}
            disabled={isSubmitting}
            {...register("password")}
          />
          {errors.password ? (
            <FieldError id="password-error">{errors.password.message}</FieldError>
          ) : null}
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}

