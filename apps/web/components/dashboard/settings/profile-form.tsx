"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Field, FieldLabel, FieldDescription } from "@workspace/ui/components/field";
import { Label } from "@workspace/ui/components/label";

import { authClient } from "@/lib/auth-client";

type Props = {
  name: string;
  email: string;
  image: string | null;
};

export function ProfileForm({ name, email, image }: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    const fd = new FormData(e.currentTarget);
    const newName = (fd.get("name") as string).trim();
    const newImage = (fd.get("image") as string).trim() || undefined;

    try {
      const { error } = await authClient.updateUser({
        name: newName,
        image: newImage,
      });

      if (error) {
        toast.error("Impossible de mettre à jour le profil.");
      } else {
        toast.success("Profil mis à jour !");
        router.refresh();
      }
    } catch {
      toast.error("Erreur réseau. Réessayez.");
    } finally {
      setIsPending(false);
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel>
              <Label>Nom complet</Label>
            </FieldLabel>
            <Input
              name="name"
              defaultValue={name}
              required
              placeholder="Jean Dupont"
            />
          </Field>

          <Field>
            <FieldLabel>
              <Label>Email</Label>
            </FieldLabel>
            <Input
              value={email}
              disabled
              className="opacity-60"
            />
            <FieldDescription>
              L&apos;email ne peut pas être modifié.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel>
              <Label>Photo de profil (URL)</Label>
            </FieldLabel>
            <Input
              name="image"
              type="url"
              defaultValue={image ?? ""}
              placeholder="https://example.com/photo.jpg"
            />
            <FieldDescription>
              Optionnel. URL vers votre photo de profil.
            </FieldDescription>
          </Field>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
