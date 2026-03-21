"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DownloadIcon, Trash2Icon, AlertTriangleIcon } from "lucide-react";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Field, FieldLabel } from "@workspace/ui/components/field";
import { Label } from "@workspace/ui/components/label";

import { deleteAccountAction } from "@/app/actions/account";

type Props = {
  email: string;
};

export function DataManagement({ email }: Props) {
  const [isPending, startTransition] = useTransition();
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();

  async function handleExport() {
    const res = await fetch("/api/account/export");
    if (!res.ok) {
      toast.error("Erreur lors de l'export.");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aliko-cv-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Données exportées !");
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAccountAction(confirmEmail);
      if (result.success) {
        toast.success("Compte supprimé.");
        router.push("/");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Données personnelles</CardTitle>
        <CardDescription>
          Exportez vos données ou supprimez votre compte conformément au RGPD.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export */}
        <div className="flex items-center justify-between rounded-none border p-3">
          <div>
            <p className="text-sm font-medium">Exporter mes données</p>
            <p className="text-xs text-muted-foreground">
              Téléchargez toutes vos données (profil, CV, clés API) au format JSON.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <DownloadIcon />
            Exporter
          </Button>
        </div>

        {/* Delete account */}
        <div className="flex items-center justify-between rounded-none border border-destructive/30 p-3">
          <div>
            <p className="text-sm font-medium text-destructive">Supprimer mon compte</p>
            <p className="text-xs text-muted-foreground">
              Supprime définitivement votre compte et toutes vos données.
            </p>
          </div>
          <Dialog open={deleteOpen} onOpenChange={(v) => { setDeleteOpen(v); if (!v) setConfirmEmail(""); }}>
            <DialogTrigger
              render={
                <Button variant="destructive" size="sm">
                  <Trash2Icon />
                  Supprimer
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangleIcon className="size-5" />
                  Supprimer le compte
                </DialogTitle>
                <DialogDescription>
                  Cette action est irréversible. Tous vos CV, sections, entrées
                  et clés API seront définitivement supprimés.
                </DialogDescription>
              </DialogHeader>
              <Field>
                <FieldLabel>
                  <Label>
                    Tapez <strong>{email}</strong> pour confirmer
                  </Label>
                </FieldLabel>
                <Input
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder={email}
                  autoComplete="off"
                />
              </Field>
              <DialogFooter>
                <Button
                  variant="destructive"
                  disabled={confirmEmail !== email || isPending}
                  onClick={handleDelete}
                >
                  {isPending ? "Suppression…" : "Supprimer définitivement"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
