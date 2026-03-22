"use client";

import { useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import {
  MessageSquareIcon,
  SendIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";

import {
  getCommentsAction,
  createCommentAction,
  updateCommentAction,
  deleteCommentAction,
} from "@/app/actions/comments";
import { extractActionError } from "@/lib/action-error";

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

// ---------------------------------------------------------------------------
// Trigger button — renders in CardAction (header)
// ---------------------------------------------------------------------------

type TriggerProps = {
  commentCount: number;
  open: boolean;
  onToggle: () => void;
};

export function SectionCommentTrigger({
  commentCount,
  open,
  onToggle,
}: TriggerProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-1 px-1.5 py-1 text-xs transition-colors ${
        open
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
      title="Notes & commentaires"
    >
      <MessageSquareIcon className="size-3.5" />
      {commentCount > 0 && (
        <Badge
          variant={open ? "default" : "secondary"}
          className="h-4 min-w-4 px-1 text-[10px]"
        >
          {commentCount}
        </Badge>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Panel — renders in CardContent (body)
// ---------------------------------------------------------------------------

type PanelProps = {
  sectionId: string;
  resumeId: string;
  onCountChange?: (count: number) => void;
};

export function SectionCommentPanel({
  sectionId,
  resumeId,
  onCountChange,
}: PanelProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const loadAction = useAction(getCommentsAction, {
    onSuccess: ({ data }) => {
      if (data) {
        setComments(data);
        setLoaded(true);
        onCountChange?.(data.length);
      }
    },
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Impossible de charger les commentaires."),
  });

  const createAction = useAction(createCommentAction, {
    onSuccess: () => {
      setNewContent("");
      refreshComments();
    },
    onError: ({ error }) => toast.error(extractActionError(error)),
  });

  const updateAction = useAction(updateCommentAction, {
    onSuccess: () => {
      setEditingId(null);
      setEditContent("");
      refreshComments();
    },
    onError: ({ error }) => toast.error(extractActionError(error)),
  });

  const deleteAction = useAction(deleteCommentAction, {
    onSuccess: ({ input }) => {
      if (input) {
        setComments((prev) => {
          const next = prev.filter((c) => c.id !== input.id);
          onCountChange?.(next.length);
          return next;
        });
      }
    },
    onError: ({ error }) => toast.error(extractActionError(error)),
  });

  useEffect(() => {
    if (!loaded) {
      loadAction.execute({ sectionId });
    }
  }, [loaded, sectionId]); // eslint-disable-line react-hooks/exhaustive-deps

  function refreshComments() {
    loadAction.execute({ sectionId });
  }

  function handleCreate() {
    if (!newContent.trim()) return;
    createAction.execute({ sectionId, resumeId, content: newContent });
  }

  function handleStartEdit(comment: Comment) {
    setEditingId(comment.id);
    setEditContent(comment.content);
  }

  function handleSaveEdit() {
    if (!editingId || !editContent.trim()) return;
    updateAction.execute({ id: editingId, resumeId, content: editContent });
  }

  function handleDelete(id: string) {
    deleteAction.execute({ id, resumeId });
  }

  const isPending =
    createAction.isExecuting ||
    updateAction.isExecuting ||
    deleteAction.isExecuting;

  return (
    <div className="border border-primary/20 bg-primary/3 p-3">
      <p className="mb-3 text-xs font-medium">Notes &amp; commentaires</p>

      {comments.length > 0 && (
        <div className="mb-3 space-y-2">
          {comments.map((c) => (
            <div
              key={c.id}
              className="group rounded-md border bg-background p-2.5"
            >
              {editingId === c.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={2}
                    className="resize-none text-xs"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={handleSaveEdit}
                      disabled={isPending}
                    >
                      <CheckIcon />
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      <XIcon />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="whitespace-pre-wrap text-xs leading-relaxed">
                    {c.content}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => handleStartEdit(c)}
                      >
                        <PencilIcon />
                      </Button>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(c.id)}
                        disabled={isPending}
                      >
                        <TrashIcon />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Ajouter une note…"
          rows={2}
          className="flex-1 resize-none bg-background text-xs"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleCreate();
            }
          }}
        />
        <Button
          size="icon-sm"
          variant="outline"
          onClick={handleCreate}
          disabled={isPending || !newContent.trim()}
          className="mt-auto"
        >
          <SendIcon />
        </Button>
      </div>
      <p className="mt-1.5 text-[10px] text-muted-foreground">
        ⌘+Entrée pour envoyer
      </p>
    </div>
  );
}
