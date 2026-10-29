// Toast notification state and helper.

import { useState, useCallback } from "react";
import { toast as toastify } from "react-toastify";

export function useDmsToast() {
  const [toastMessage, setToastMessage] = useState("");

  const setToast = useCallback(
    (
      msg: string,
      type?: "success" | "error" | "info" | "warning",
    ) => {
      setToastMessage(msg);

      if (!msg) return;

      const lower = msg.toLowerCase();

      if (
        type === "error" ||
        lower.includes("failed") ||
        lower.includes("error") ||
        lower.includes("invalid") ||
        lower.includes("not found") ||
        lower.includes("already exists") ||
        lower.includes("only administrator") ||
        lower.includes("unable to")
      ) {
        toastify.error(msg);
      } else if (
        type === "success" ||
        lower.includes("success") ||
        lower.includes("created") ||
        lower.includes("added") ||
        lower.includes("renamed") ||
        lower.includes("deleted") ||
        lower.includes("updated") ||
        lower.includes("restored") ||
        lower.includes("copied")
      ) {
        toastify.success(msg);
      } else if (type === "warning") {
        toastify.warning(msg);
      } else {
        toastify.info(msg);
      }
    },
    [],
  );

  const toast = toastMessage;

  const notify = (message: string) => setToast(message);

  return {
    toast,
    setToast,
    notify,
  };
}
