"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type AutosaveStatus = "idle" | "saving" | "saved" | "error";

type UseAutosaveOptions<T> = {
  data: T;
  onSave: (data: T) => Promise<{ success: boolean }>;
  delay?: number;
  enabled?: boolean;
};

export function useAutosave<T>({
  data,
  onSave,
  delay = 800,
  enabled = true,
}: UseAutosaveOptions<T>) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>(JSON.stringify(data));
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const serialized = JSON.stringify(data);
    if (serialized === lastSavedRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setStatus("saving");
      try {
        const result = await onSave(data);
        if (!isMountedRef.current) return;
        if (result.success) {
          lastSavedRef.current = serialized;
          setStatus("saved");
          setTimeout(() => {
            if (isMountedRef.current) setStatus("idle");
          }, 2000);
        } else {
          setStatus("error");
        }
      } catch {
        if (isMountedRef.current) setStatus("error");
      }
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, delay, enabled, onSave]);

  const resetRef = useCallback((newData: T) => {
    lastSavedRef.current = JSON.stringify(newData);
  }, []);

  return { status, resetRef };
}
