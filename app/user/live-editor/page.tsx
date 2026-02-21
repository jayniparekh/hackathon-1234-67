"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FilePlus, FileText } from "@phosphor-icons/react";

type Doc = {
  id: string;
  content: string;
  currentVersion: number;
  updatedAt: string;
};

export default function LiveEditorPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/documents")
      .then((r) => r.json())
      .then((data) => {
        if (data.documents) setDocs(data.documents);
      })
      .finally(() => setLoading(false));
  }, []);

  const createNew = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "" }),
      });
      const data = await res.json();
      if (data.id) window.location.href = `/user/live-editor/${data.id}`;
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
          Live Editor
        </h1>
        <button
          type="button"
          onClick={createNew}
          disabled={creating}
          className="flex items-center gap-2 rounded-[var(--radius-base)] border-2 border-border bg-main px-4 py-2 text-sm font-semibold text-main-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50"
        >
          <FilePlus size={18} weight="duotone" />
          {creating ? "Creating…" : "New document"}
        </button>
      </div>
      {loading ? (
        <div className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-6 text-center text-foreground/70">
          Loading…
        </div>
      ) : docs.length === 0 ? (
        <div className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-8 text-center text-foreground/70">
          No documents yet. Create one to start collaborating in real time.
        </div>
      ) : (
        <ul className="space-y-2">
          {docs.map((d) => (
            <li key={d.id}>
              <Link
                href={`/user/live-editor/${d.id}`}
                className="flex items-center gap-3 rounded-[var(--radius-base)] border-2 border-border bg-background px-4 py-3 text-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                <FileText size={20} weight="duotone" />
                <span className="flex-1 truncate">
                  {d.content?.slice(0, 60) || "Untitled"}
                  {d.content && d.content.length > 60 ? "…" : ""}
                </span>
                <span className="text-xs text-foreground/60">
                  {d.updatedAt
                    ? new Date(d.updatedAt).toLocaleDateString()
                    : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
