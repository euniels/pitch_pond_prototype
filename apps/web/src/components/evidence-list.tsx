"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Download, FileCheck2, Trash2 } from "lucide-react";

type EvidenceListItem = {
  id: string;
  title: string;
  fileName: string;
  status: string;
  evidenceDate: string;
};

export function EvidenceList({ items }: { items: EvidenceListItem[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function remove(id: string) {
    const response = await fetch(`/api/evidence/${id}/delete`, {
      method: "POST",
    });
    const payload = await response.json();
    setMessage(
      payload.message ??
        (response.ok ? "Evidence removed." : "Removal failed."),
    );
    if (response.ok) router.refresh();
  }

  if (!items.length) return null;
  return (
    <div className="evidence-list">
      {items.map((item) => (
        <article key={item.id}>
          <FileCheck2 />
          <div>
            <strong>{item.title}</strong>
            <span>
              {item.fileName} · {item.evidenceDate} · {item.status}
            </span>
          </div>
          <div className="match-actions">
            {item.status === "ready" && (
              <a
                className="button button-quiet"
                href={`/api/evidence/${item.id}/download`}
              >
                <Download /> Download
              </a>
            )}
            <button
              className="button button-quiet"
              type="button"
              onClick={() => remove(item.id)}
            >
              <Trash2 /> Delete
            </button>
          </div>
        </article>
      ))}
      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
