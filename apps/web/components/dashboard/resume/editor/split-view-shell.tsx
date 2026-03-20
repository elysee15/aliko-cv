"use client";

import { useState, type ReactNode } from "react";
import { PenLineIcon, EyeIcon } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

type Props = {
  toolbar: ReactNode;
  editor: ReactNode;
  preview: ReactNode;
};

export function SplitViewShell({ toolbar, editor, preview }: Props) {
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

  return (
    <div className="-m-4 flex h-[calc(100svh-3.5rem)] flex-col print:m-0 print:h-auto">
      {/* Toolbar — hidden when printing */}
      <div className="print:hidden">{toolbar}</div>

      {/* Mobile tabs — hidden when printing */}
      <div className="flex border-b lg:hidden print:hidden">
        <button
          type="button"
          onClick={() => setActiveTab("editor")}
          className={`flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "editor"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          role="tab"
          aria-selected={activeTab === "editor"}
        >
          <PenLineIcon className="size-3.5" />
          Éditeur
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "preview"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          role="tab"
          aria-selected={activeTab === "preview"}
        >
          <EyeIcon className="size-3.5" />
          Aperçu
        </button>
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1 print:block">
        {/* Editor pane — hidden when printing */}
        <div
          className={`w-full overflow-y-auto lg:block lg:w-1/2 lg:border-r print:hidden ${
            activeTab === "editor" ? "block" : "hidden"
          }`}
        >
          {editor}
        </div>

        {/* Preview pane — always visible when printing, full-width */}
        <div
          className={`w-full overflow-y-auto bg-muted/30 p-4 lg:block lg:w-1/2 print:block print:w-full print:overflow-visible print:bg-white print:p-0 ${
            activeTab === "preview" ? "block" : "hidden"
          }`}
        >
          <div className="mx-auto max-w-[210mm] print:max-w-none">{preview}</div>
        </div>
      </div>
    </div>
  );
}
