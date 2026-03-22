"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SubmitErrorHandler } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { PlusIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";

import type { ApplicationStatus } from "@aliko-cv/db/queries";
import { APPLICATION_STATUSES } from "@/lib/application-status";
import {
  createApplicationAction,
  updateApplicationAction,
  deleteApplicationAction,
} from "@/app/actions/applications";
import { extractActionError } from "@/lib/action-error";
import {
  createApplicationSchema,
  type CreateApplicationInput,
} from "@/lib/schemas/applications";

type ApplicationData = {
  id: string;
  company: string;
  jobTitle: string;
  jobUrl?: string | null;
  status: ApplicationStatus;
  appliedAt?: string | null;
  notes?: string | null;
  resumeId?: string | null;
  coverLetterId?: string | null;
};

type Props = {
  resumes?: { id: string; title: string }[];
  coverLetters?: { id: string; title: string }[];
  editData?: ApplicationData | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerHidden?: boolean;
};

const DEFAULT_VALUES: CreateApplicationInput = {
  company: "",
  jobTitle: "",
  jobUrl: "",
  status: "wishlist",
  appliedAt: "",
  notes: "",
  resumeId: "",
  coverLetterId: "",
};

export function ApplicationDialog({
  resumes = [],
  coverLetters = [],
  editData,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  triggerHidden = false,
}: Props) {
  const router = useRouter();
  const isEdit = !!editData;

  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  const { form, action: createAction, resetFormAndAction } =
    useHookFormAction(
      createApplicationAction,
      zodResolver(createApplicationSchema),
      {
        formProps: { defaultValues: DEFAULT_VALUES },
        actionProps: {
          onSuccess: () => {
            toast.success("Candidature créée !");
            setOpen(false);
            resetFormAndAction();
            router.refresh();
          },
          onError: ({ error }) => toast.error(extractActionError(error)),
        },
      },
    );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    reset,
    setFocus,
  } = form;

  const status = useWatch({ control, name: "status" });
  const appliedAt = useWatch({ control, name: "appliedAt" });
  const resumeId = useWatch({ control, name: "resumeId" });
  const coverLetterId = useWatch({ control, name: "coverLetterId" });

  const updateAction = useAction(updateApplicationAction, {
    onSuccess: () => {
      toast.success("Candidature mise à jour !");
      setOpen(false);
      router.refresh();
    },
    onError: ({ error }) => toast.error(extractActionError(error)),
  });

  const delAction = useAction(deleteApplicationAction, {
    onSuccess: () => {
      toast.success("Candidature supprimée.");
      setOpen(false);
      router.refresh();
    },
    onError: ({ error }) => toast.error(extractActionError(error)),
  });

  const loading =
    createAction.isExecuting ||
    updateAction.isExecuting ||
    delAction.isExecuting;

  useEffect(() => {
    if (open && editData) {
      reset({
        company: editData.company,
        jobTitle: editData.jobTitle,
        jobUrl: editData.jobUrl ?? "",
        status: editData.status,
        appliedAt: editData.appliedAt ?? "",
        notes: editData.notes ?? "",
        resumeId: editData.resumeId ?? "",
        coverLetterId: editData.coverLetterId ?? "",
      });
    } else if (open && !editData) {
      resetFormAndAction();
    }
  }, [open, editData, reset, resetFormAndAction]);

  const onInvalid: SubmitErrorHandler<CreateApplicationInput> = (
    formErrors,
  ) => {
    const order: (keyof CreateApplicationInput)[] = [
      "company",
      "jobTitle",
      "jobUrl",
      "notes",
    ];
    const first = order.find((k) => formErrors[k]);
    if (first) void setFocus(first);
  };

  function onSubmit(values: CreateApplicationInput) {
    const payload = {
      company: values.company,
      jobTitle: values.jobTitle,
      jobUrl:
        typeof values.jobUrl === "string" && values.jobUrl.trim()
          ? values.jobUrl.trim()
          : null,
      status: values.status,
      appliedAt: values.appliedAt || null,
      notes:
        typeof values.notes === "string" && values.notes.trim()
          ? values.notes.trim()
          : null,
      resumeId: values.resumeId || null,
      coverLetterId: values.coverLetterId || null,
    };

    if (isEdit) {
      updateAction.execute({ id: editData.id, ...payload });
    } else {
      createAction.execute(payload);
    }
  }

  function handleStatusChange(newStatus: ApplicationStatus) {
    setValue("status", newStatus);
    if (newStatus !== "wishlist" && newStatus !== "archived" && !appliedAt) {
      setValue("appliedAt", new Date().toISOString().slice(0, 10));
    }
  }

  function handleDelete() {
    if (!editData) return;
    delAction.execute({ id: editData.id });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!triggerHidden && (
        <DialogTrigger
          render={
            <Button size="sm">
              <PlusIcon />
              Nouvelle candidature
            </Button>
          }
        />
      )}
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifier la candidature" : "Nouvelle candidature"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          noValidate
          className="space-y-3"
        >
          <FieldGroup>
            <Field data-invalid={!!errors.company}>
              <FieldLabel htmlFor="app-company">
                Entreprise{" "}
                <span className="text-destructive" aria-hidden>
                  *
                </span>
              </FieldLabel>
              <Input
                id="app-company"
                placeholder="Ex : Google"
                aria-required="true"
                aria-invalid={!!errors.company}
                aria-describedby={
                  errors.company ? "app-company-error" : undefined
                }
                className={errors.company ? "border-destructive" : undefined}
                disabled={loading}
                {...register("company")}
              />
              {errors.company ? (
                <FieldError id="app-company-error">
                  {errors.company.message}
                </FieldError>
              ) : null}
            </Field>

            <Field data-invalid={!!errors.jobTitle}>
              <FieldLabel htmlFor="app-jobTitle">
                Poste{" "}
                <span className="text-destructive" aria-hidden>
                  *
                </span>
              </FieldLabel>
              <Input
                id="app-jobTitle"
                placeholder="Ex : Développeur Full-Stack"
                aria-required="true"
                aria-invalid={!!errors.jobTitle}
                aria-describedby={
                  errors.jobTitle ? "app-jobTitle-error" : undefined
                }
                className={errors.jobTitle ? "border-destructive" : undefined}
                disabled={loading}
                {...register("jobTitle")}
              />
              {errors.jobTitle ? (
                <FieldError id="app-jobTitle-error">
                  {errors.jobTitle.message}
                </FieldError>
              ) : null}
            </Field>

            <Field data-invalid={!!errors.jobUrl}>
              <FieldLabel htmlFor="app-jobUrl">
                URL de l&apos;offre
              </FieldLabel>
              <Input
                id="app-jobUrl"
                type="url"
                placeholder="https://..."
                aria-invalid={!!errors.jobUrl || undefined}
                aria-describedby={
                  errors.jobUrl ? "app-jobUrl-error" : undefined
                }
                className={errors.jobUrl ? "border-destructive" : undefined}
                disabled={loading}
                {...register("jobUrl")}
              />
              {errors.jobUrl ? (
                <FieldError id="app-jobUrl-error">
                  {errors.jobUrl.message}
                </FieldError>
              ) : null}
            </Field>
          </FieldGroup>

          <Field>
            <FieldLabel>Statut</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {APPLICATION_STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => handleStatusChange(s.value)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                    status === s.value
                      ? `${s.bgClass} ring-2 ring-offset-1 ring-current/30`
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="app-appliedAt">
              Date de candidature
            </FieldLabel>
            <Input
              id="app-appliedAt"
              type="date"
              disabled={loading}
              {...register("appliedAt")}
            />
          </Field>

          {resumes.length > 0 && (
            <Field>
              <FieldLabel>CV associé</FieldLabel>
              <Select
                value={resumeId || "none"}
                onValueChange={(val) =>
                  setValue("resumeId", !val || val === "none" ? "" : val)
                }
                items={[
                  { value: "none", label: "Aucun" },
                  ...resumes.map((r) => ({ value: r.id, label: r.title })),
                ]}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Aucun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {resumes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          {coverLetters.length > 0 && (
            <Field>
              <FieldLabel>Lettre de motivation</FieldLabel>
              <Select
                value={coverLetterId || "none"}
                onValueChange={(val) =>
                  setValue(
                    "coverLetterId",
                    !val || val === "none" ? "" : val,
                  )
                }
                items={[
                  { value: "none", label: "Aucune" },
                  ...coverLetters.map((cl) => ({
                    value: cl.id,
                    label: cl.title,
                  })),
                ]}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Aucune" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {coverLetters.map((cl) => (
                    <SelectItem key={cl.id} value={cl.id}>
                      {cl.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          <Field data-invalid={!!errors.notes}>
            <FieldLabel htmlFor="app-notes">Notes</FieldLabel>
            <Textarea
              id="app-notes"
              placeholder="Contact, remarques, suivi…"
              rows={3}
              className={`resize-none text-xs ${errors.notes ? "border-destructive" : ""}`}
              aria-invalid={!!errors.notes || undefined}
              aria-describedby={errors.notes ? "app-notes-error" : undefined}
              disabled={loading}
              {...register("notes")}
            />
            {errors.notes ? (
              <FieldError id="app-notes-error">
                {errors.notes.message}
              </FieldError>
            ) : null}
          </Field>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  {isEdit ? "Mise à jour…" : "Création…"}
                </>
              ) : isEdit ? (
                "Enregistrer"
              ) : (
                "Créer"
              )}
            </Button>
            {isEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                disabled={loading}
                className="text-destructive hover:text-destructive"
              >
                Supprimer
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
