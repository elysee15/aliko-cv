"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";

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
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Field, FieldLabel } from "@workspace/ui/components/field";
import { Label } from "@workspace/ui/components/label";

import { createSectionAction } from "@/app/actions/resume";
import {
  sectionTypes,
  sectionTypeLabels,
  type SectionType,
} from "@/lib/schemas/resume";
import { SectionEditor } from "./section-editor";

type Entry = {
  id: string;
  title: string;
  subtitle: string | null;
  organization: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  description: string | null;
  sortOrder: number;
  visible: boolean;
};

type Section = {
  id: string;
  type: SectionType;
  title: string;
  sortOrder: number;
  visible: boolean;
  entries: Entry[];
};

type Props = {
  resumeId: string;
  sections: Section[];
};

export function SectionList({ resumeId, sections }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedType, setSelectedType] = useState<SectionType>("experience");
  const [sectionTitle, setSectionTitle] = useState("");

  function handleTypeChange(val: SectionType) {
    setSelectedType(val);
    setSectionTitle(sectionTypeLabels[val]);
  }

  function handleCreate() {
    if (!sectionTitle.trim()) return;
    startTransition(async () => {
      const result = await createSectionAction({
        resumeId,
        type: selectedType,
        title: sectionTitle,
        sortOrder: sections.length,
      });
      if (result.success) {
        toast.success("Section ajoutée.");
        setOpen(false);
        setSectionTitle("");
        setSelectedType("experience");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">Sections</h2>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (o) {
              setSelectedType("experience");
              setSectionTitle(sectionTypeLabels.experience);
            }
          }}
        >
          <DialogTrigger
            render={
              <Button variant="outline" size="sm">
                <PlusIcon data-icon="inline-start" />
                Ajouter une section
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle section</DialogTitle>
              <DialogDescription>
                Choisissez le type et le titre de la section.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Field>
                <FieldLabel>
                  <Label>Type</Label>
                </FieldLabel>
                <Select
                  value={selectedType}
                  onValueChange={(val) =>
                    handleTypeChange(val as SectionType)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {sectionTypeLabels[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>Titre</Label>
                </FieldLabel>
                <Input
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  placeholder="Ex: Expérience professionnelle"
                />
              </Field>
            </div>

            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={isPending || !sectionTitle.trim()}
              >
                {isPending ? "Ajout…" : "Ajouter"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-xl border border-dashed py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Aucune section. Ajoutez Expérience, Formation, Compétences…
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <SectionEditor
              key={section.id}
              resumeId={resumeId}
              section={section}
            />
          ))}
        </div>
      )}
    </div>
  );
}
