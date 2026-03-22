"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { profileSchema, type ProfileInput } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";

type Props = {
  name: string;
  image: string | null;
};

export function ProfileForm({ name, image }: Props) {
  const router = useRouter();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name, image: image ?? "" },
  });

  const onInvalid: SubmitErrorHandler<ProfileInput> = (formErrors) => {
    const order: (keyof ProfileInput)[] = ["name", "image"];
    const first = order.find((k) => formErrors[k]);
    if (first) void setFocus(first);
  };

  async function onSubmit(values: ProfileInput) {
    setGlobalError(null);

    try {
      const { error } = await authClient.updateUser({
        name: values.name,
        image: values.image || null,
      });

      if (error) {
        setGlobalError("Impossible de mettre à jour le profil.");
      } else {
        toast.success("Profil mis à jour !");
        router.refresh();
      }
    } catch {
      setGlobalError("Erreur réseau. Réessayez.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>
          Ces informations apparaissent sur vos CV publiés.
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
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="profile-name">
                Nom complet{" "}
                <span className="text-destructive" aria-hidden>
                  *
                </span>
              </FieldLabel>
              <Input
                id="profile-name"
                placeholder="Jean Dupont"
                autoComplete="name"
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={
                  errors.name ? "profile-name-error" : undefined
                }
                className={errors.name ? "border-destructive" : undefined}
                disabled={isSubmitting}
                {...register("name")}
              />
              {errors.name ? (
                <FieldError id="profile-name-error">
                  {errors.name.message}
                </FieldError>
              ) : null}
            </Field>

            <Field data-invalid={!!errors.image}>
              <FieldLabel htmlFor="profile-image">
                Photo de profil (URL)
              </FieldLabel>
              <Input
                id="profile-image"
                type="url"
                placeholder="https://example.com/photo.jpg"
                aria-invalid={!!errors.image}
                aria-describedby={
                  errors.image
                    ? "profile-image-error profile-image-hint"
                    : "profile-image-hint"
                }
                className={errors.image ? "border-destructive" : undefined}
                disabled={isSubmitting}
                {...register("image")}
              />
              <FieldDescription id="profile-image-hint">
                Optionnel. URL vers votre photo de profil.
              </FieldDescription>
              {errors.image ? (
                <FieldError id="profile-image-error">
                  {errors.image.message}
                </FieldError>
              ) : null}
            </Field>
          </FieldGroup>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
