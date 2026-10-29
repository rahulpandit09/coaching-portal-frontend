import React, { useRef, useState } from "react";
import { AlertTriangle, Check, KeyRound, Lock, Send, X } from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";
import { Modal } from "../Common/Modal";
import type { DocumentRecord } from "../types";

type ToastMessage = {
  type: "error" | "success";
  message: string;
};

export function RequestAccessModal({
  document,
  reason,
  onReasonChange,
  onClose,
  onSubmit,
}: {
  document: DocumentRecord;
  reason: string;
  onReasonChange: (val: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showErrorToast = (message: string) => {
    setToast({ type: "error", message });
    window.setTimeout(() => setToast(null), 3500);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!reason.trim()) {
      showErrorToast("Please enter a reason for requesting access.");
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    if (!reason.trim()) {
      setShowConfirmation(false);
      showErrorToast("Please enter a reason for requesting access.");
      return;
    }

    setIsSubmitting(true);
    setShowConfirmation(false);

    // The parent handler owns the API request. Pass it a form event after confirmation.
    const submitEvent = {
      preventDefault: () => undefined,
      currentTarget: formRef.current,
      target: formRef.current,
    } as unknown as React.FormEvent<HTMLFormElement>;

    try {
      await onSubmit(submitEvent);
    } catch (error) {
      console.error("Failed to submit access request:", error);
      showErrorToast("Failed to submit the access request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        title={`Request Access For Document: ${document.number}`}
        onClose={onClose}
        maxWidth="max-w-lg"
      >
        <form
          ref={formRef}
          onSubmit={handleFormSubmit}
          className="space-y-4 pb-2 text-sm"
        >
          {/* Warning Banner */}
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Lock className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-amber-900">
                Authorization Required to Open Document
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-amber-800">
                This document is restricted to authorized custody. Submit an access
                request with your business justification to notify the assigned publisher.
              </p>
            </div>
          </div>

          {/* Document Details Card */}
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-sm font-semibold text-blue-700">
                {document.number}
              </span>

              <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600">
                {document.revision}
              </span>
            </div>

            <h4 className="text-sm font-semibold leading-relaxed text-slate-900">
              {document.title}
            </h4>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-200 pt-3 text-xs">
              <div className="min-w-0">
                <p className="mb-1 text-slate-500">Department</p>
                <p className="break-words font-medium text-slate-800">
                  {document.department || "—"} · {document.location || "—"}
                </p>
              </div>

              <div className="min-w-0">
                <p className="mb-1 text-slate-500">Classification</p>
                <p className="font-medium text-slate-800">
                  {document.securityClassification || "Internal"}
                </p>
              </div>

              <div className="min-w-0">
                <p className="mb-1 text-slate-500">Folder</p>
                <p className="break-words font-medium text-slate-800">
                  {document.folder || "General"}
                </p>
              </div>

              <div className="min-w-0">
                <p className="mb-1 text-slate-500">Assigned Custodian</p>
                <p className="break-words font-medium text-slate-800">
                  {document.custodian || document.owner || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Justification Textarea */}
          <div className="space-y-2">
            <label
              htmlFor="access-request-reason"
              className="block text-xs font-semibold text-slate-800"
            >
              Reason / Business Justification for Access
              <span className="ml-1 text-red-500">*</span>
            </label>

            <textarea
              id="access-request-reason"
              required
              rows={3}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Explain why you need access to this document, such as a maintenance audit or compliance inspection..."
              className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="text-xs leading-relaxed text-slate-500">
              The assigned publisher will review your justification and may grant
              access for a specified period (From / To).
            </p>
          </div>

          {/* Sticky Action Footer */}
          <div className="sticky bottom-0 z-20 -mx-1 mt-2 flex flex-col-reverse gap-2 border-t border-slate-200 bg-white px-1 py-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 cursor-pointer border-slate-300 bg-white px-5 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              size="sm"
              className="h-10 cursor-pointer gap-2 bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              <span>
                {isSubmitting ? "Submitting Request..." : "Submit Request to Publisher"}
              </span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Custom Confirmation Popup — kept outside the main Modal to avoid stacking issues */}
      {showConfirmation && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-access-request-title"
            className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-2xl text-slate-900"
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                <KeyRound className="h-5 w-5" />
              </div>
              <h3
                id="confirm-access-request-title"
                className="text-sm font-semibold text-slate-900"
              >
                Confirm Access Request
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Submit an access request for <strong className="text-slate-900">{document.number}</strong>? The assigned Publisher will review your justification.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmation(false)}
                className="cursor-pointer border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isSubmitting}
                onClick={handleConfirmSubmit}
                className="gap-1.5 bg-blue-600 font-semibold text-white hover:bg-blue-700 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                Confirm Submit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          role="alert"
          className={`fixed right-4 top-4 z-[10000] flex max-w-sm items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-xl ${toast.type === "error"
              ? "border-red-500/30 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
              : "border-emerald-500/30 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
            }`}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="flex-1">{toast.message}</span>
          <button type="button" aria-label="Dismiss notification" onClick={() => setToast(null)} className="ml-1 rounded p-0.5 hover:bg-black/5">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}
