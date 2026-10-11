"use client";

import { useActionState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import type { ActionState } from "@/app/workspace/actions";

export function ActionForm({
  action,
  children,
  submitLabel,
}: {
  action: (state: ActionState, data: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {
    ok: false,
    message: "",
  });
  return (
    <form action={formAction} className="workspace-form">
      {children}
      {state.message && (
        <div className={state.ok ? "form-success" : "form-error"} role="status">
          {state.ok && <CheckCircle2 />}
          {state.message}
        </div>
      )}
      <button className="button button-primary" disabled={pending}>
        {pending ? <LoaderCircle className="spin" /> : submitLabel}
      </button>
    </form>
  );
}
