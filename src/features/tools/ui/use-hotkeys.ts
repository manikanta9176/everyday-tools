"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { copyText } from "@/lib/clipboard";

export function useToolHotkeys(run: () => void, copyValue = "") {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key === "Enter") {
        event.preventDefault();
        run();
      }
      if (meta && event.shiftKey && event.key.toLowerCase() === "c" && copyValue) {
        event.preventDefault();
        void copyText(copyValue).then(
          () => toast.success("Copied"),
          () => toast.error("Could not copy"),
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [copyValue, run]);
}
