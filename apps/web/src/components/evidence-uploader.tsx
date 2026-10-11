"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { FileCheck2, LoaderCircle, UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ALLOWED_EVIDENCE_TYPES, MAX_EVIDENCE_BYTES } from "@/lib/evidence";

export function EvidenceUploader({ ventureId }: { ventureId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState({
    loading: false,
    message: "",
    ok: false,
  });
  function pick(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
    setState({ loading: false, message: "", ok: false });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    setState({
      loading: true,
      message: "Preparing a private upload…",
      ok: false,
    });
    const form = new FormData(event.currentTarget);
    try {
      if (
        file.size > MAX_EVIDENCE_BYTES ||
        !ALLOWED_EVIDENCE_TYPES.includes(
          file.type as (typeof ALLOWED_EVIDENCE_TYPES)[number],
        )
      )
        throw new Error("Choose an allowed file no larger than 10 MB.");
      const metadata = {
        ventureId,
        title: String(form.get("title")),
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        evidenceDate: String(form.get("evidenceDate")),
      };
      const init = await fetch("/api/evidence/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadata),
      });
      const prepared = await init.json();
      if (!init.ok) throw new Error(prepared.message);
      setState({
        loading: true,
        message: "Uploading to the private quarantine…",
        ok: false,
      });
      const supabase = createClient();
      const { error } = await supabase.storage
        .from("evidence")
        .uploadToSignedUrl(prepared.path, prepared.token, file, {
          contentType: file.type,
        });
      if (error) throw error;
      setState({
        loading: true,
        message: "Scanning and extracting supported text…",
        ok: false,
      });
      const complete = await fetch(
        `/api/evidence/${prepared.evidenceId}/complete`,
        { method: "POST" },
      );
      const result = await complete.json();
      if (!complete.ok) throw new Error(result.message);
      setState({
        loading: false,
        message: "Evidence is clean, private, and ready to link.",
        ok: true,
      });
      setFile(null);
      event.currentTarget.reset();
    } catch (error) {
      setState({
        loading: false,
        message:
          error instanceof Error ? error.message : "Upload failed safely.",
        ok: false,
      });
    }
  }
  return (
    <form className="evidence-uploader" onSubmit={submit}>
      <div>
        <UploadCloud />
        <h3>Add evidence</h3>
        <p>PDF, DOCX, XLSX, CSV, JPG, or PNG · 10 MB maximum</p>
      </div>
      <label>
        <span>Evidence title</span>
        <input name="title" required minLength={3} maxLength={120} />
      </label>
      <label>
        <span>Evidence date</span>
        <input name="evidenceDate" type="date" required />
      </label>
      <label className="file-picker">
        <input
          type="file"
          onChange={pick}
          required
          accept={ALLOWED_EVIDENCE_TYPES.join(",")}
        />
        <span>{file ? file.name : "Choose a private file"}</span>
      </label>
      {state.message && (
        <div
          className={state.ok ? "form-success" : "form-message"}
          role="status"
        >
          {state.ok && <FileCheck2 />}
          {state.message}
        </div>
      )}
      <button
        className="button button-secondary"
        disabled={!file || state.loading}
      >
        {state.loading ? (
          <LoaderCircle className="spin" />
        ) : (
          "Upload and verify"
        )}
      </button>
    </form>
  );
}
