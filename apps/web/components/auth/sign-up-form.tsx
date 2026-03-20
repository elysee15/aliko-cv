"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@workspace/ui/components/button";
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
  signUpPasswordRules,
  signUpSchema,
  type SignUpInput,
} from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";

export function SignUpForm() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignUpInput) {
    setGlobalError(null);

    try {
      const { error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: `${window.location.origin}/dashboard`,
      });

      if (error) {
        const message = error.message ?? "Une erreur est survenue.";
        if (
          message.toLowerCase().includes("already") ||
          message.toLowerCase().includes("exist") ||
          message.toLowerCase().includes("email")
        ) {
          setGlobalError(
            "Un compte existe déjà avec cet email. Connectez-vous ou réinitialisez le mot de passe."
          );
          setError("email", { message: "Cet email est déjà utilisé." });
        } else {
          setGlobalError(
            typeof message === "string" ? message : "Inscription impossible. Réessayez."
          );
        }
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
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">
            Nom <span className="text-destructive" aria-hidden>*</span>
          </FieldLabel>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            required
            aria-required="true"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={errors.name ? "border-destructive" : undefined}
            disabled={isSubmitting}
            {...register("name")}
          />
          {errors.name ? (
            <FieldError id="name-error">{errors.name.message}</FieldError>
          ) : null}
        </Field>

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
            autoComplete="new-password"
            required
            aria-required="true"
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? "password-error" : "password-hint"
            }
            className={errors.password ? "border-destructive" : undefined}
            disabled={isSubmitting}
            {...register("password")}
          />
          <FieldDescription id="password-hint">
            {signUpPasswordRules.description}
          </FieldDescription>
          {errors.password ? (
            <FieldError id="password-error">{errors.password.message}</FieldError>
          ) : null}
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Inscription…" : "S'inscrire"}
      </Button>
    </form>
  );
}

