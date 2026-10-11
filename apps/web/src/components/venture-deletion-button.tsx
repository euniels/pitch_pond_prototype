"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VentureDeletionButton({ ventureId }: { ventureId: string }) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState("");

  async function requestDeletion() {
    if (!confirmed) return;
    const response = await fetch(`/api/ventures/${ventureId}/delete`, {
      method: "POST",
    });
    const payload = await response.json();
    setMessage(payload.message ?? "The request could not be recorded.");
    if (response.ok) router.refresh();
  }

  return (
    <div className="danger-zone">
      <strong>Request venture deletion</strong>
      <p>
        This disables matching immediately and queues the venture and its
        evidence for a retention review.
      </p>
      <label className="check-row">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
        />
        <span>
          I understand this request affects the complete venture workspace.
        </span>
      </label>
      <button
        className="button button-quiet"
        type="button"
        disabled={!confirmed}
        onClick={requestDeletion}
      >
        Request deletion
      </button>
      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
