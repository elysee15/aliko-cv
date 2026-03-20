"use client";

import { useState } from "react";
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
import { Field, FieldLabel } from "@workspace/ui/components/field";
import { Label } from "@workspace/ui/components/label";

import { authClient } from "@/lib/auth-client";

export function ChangePasswordForm() {
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const currentPassword = fd.get("currentPassword") as string;
    const newPassword = fd.get("newPassword") as string;
    const confirmPassword = fd.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setIsPending(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        toast.error("Mot de passe actuel incorrect.");
      } else {
        toast.success("Mot de passe modifié !");
        e.currentTarget.reset();
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
        <CardTitle>Mot de passe</CardTitle>
        <CardDescription>
          Modifiez votre mot de passe. Les autres sessions seront déconnectées.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel>
              <Label>Mot de passe actuel</Label>
            </FieldLabel>
            <Input
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>

          <Field>
            <FieldLabel>
              <Label>Nouveau mot de passe</Label>
            </FieldLabel>
            <Input
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </Field>

          <Field>
            <FieldLabel>
              <Label>Confirmer le nouveau mot de passe</Label>
            </FieldLabel>
            <Input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </Field>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Modification…" : "Modifier le mot de passe"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
