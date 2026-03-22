"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      closeButton
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "0px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "font-sans text-[13px]! shadow-md ring-1 ring-foreground/10 border-none",
          title: "font-heading text-[14px]! font-medium",
          description: "text-[13px]! text-muted-foreground",
          actionButton:
            "bg-primary text-primary-foreground text-[13px]! font-medium",
          cancelButton: "bg-muted text-muted-foreground text-[13px]! font-medium",
          closeButton:
            "border-border/50 bg-background text-foreground/50 hover:text-foreground text-[13px]!",
        },
      }}
      {...props}
    />
  );
}
