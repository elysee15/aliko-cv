"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LinkedinIcon, UploadIcon, FileArchiveIcon, XIcon, Loader2Icon } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";

type ImportStats = {
  positions: number;
  education: number;
  skills: number;
  certifications: number;
  languages: number;
};

export function ImportLinkedInDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = useCallback((f: File | null) => {
    if (f && !f.name.endsWith(".zip")) {
      toast.error("Veuillez sélectionner un fichier ZIP.");
      return;
    }
    setFile(f);
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  }

  async function handleImport() {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resume/import-linkedin", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Erreur lors de l'import");
        return;
      }

      const stats = data.stats as ImportStats;
      const parts: string[] = [];
      if (stats.positions > 0) parts.push(`${stats.positions} expérience(s)`);
      if (stats.education > 0) parts.push(`${stats.education} formation(s)`);
      if (stats.skills > 0) parts.push(`${stats.skills} compétence(s)`);
      if (stats.certifications > 0) parts.push(`${stats.certifications} certification(s)`);
      if (stats.languages > 0) parts.push(`${stats.languages} langue(s)`);

      toast.success(`Import réussi : ${parts.join(", ")}`);
      setFile(null);
      setOpen(false);
      router.push(`/dashboard/${data.resumeId}`);
      router.refresh();
    } catch {
      toast.error("Erreur réseau lors de l'import.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setFile(null); }}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <LinkedinIcon data-icon="inline-start" />
            Importer LinkedIn
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importer depuis LinkedIn</DialogTitle>
          <DialogDescription>
            Uploadez le fichier ZIP d&apos;export officiel LinkedIn pour
            préremplir automatiquement votre CV.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Instructions */}
          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <p className="font-medium">Comment obtenir le fichier ?</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
              <li>
                Allez sur{" "}
                <a
                  href="https://www.linkedin.com/mypreferences/d/download-my-data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  linkedin.com/mypreferences/d/download-my-data
                </a>
              </li>
              <li>Sélectionnez &quot;Télécharger une archive plus complète&quot;</li>
              <li>Attendez l&apos;email de LinkedIn (quelques minutes)</li>
              <li>Téléchargez le fichier ZIP et uploadez-le ici</li>
            </ol>
          </div>

          {/* Drop zone */}
          <div
            className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : file
                  ? "border-green-500/50 bg-green-50 dark:bg-green-950/20"
                  : "border-muted-foreground/25"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex items-center gap-3">
                <FileArchiveIcon className="size-8 text-green-600 dark:text-green-400" />
                <div className="text-sm">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(1)} Mo
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setFile(null)}
                  disabled={uploading}
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            ) : (
              <>
                <UploadIcon className="mb-2 size-8 text-muted-foreground/50" />
                <p className="text-sm font-medium">
                  Glissez votre fichier ZIP ici
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  ou{" "}
                  <button
                    type="button"
                    className="text-primary underline underline-offset-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    parcourez vos fichiers
                  </button>
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleImport}
            disabled={!file || uploading}
          >
            {uploading ? (
              <>
                <Loader2Icon className="animate-spin" />
                Import en cours…
              </>
            ) : (
              "Importer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
