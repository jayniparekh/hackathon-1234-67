"use client";

import { useState, useCallback } from "react";

type Edit = {
  editId: string;
  original: string;
  enhanced: string;
  changeType: "grammar" | "style" | "clarity" | "seo";
  reasoning: string;
  confidence: number;
  impactPrediction?: string;
  sources?: string[];
  userAction?: "accepted" | "rejected" | null;
};

type Revision = { version: number; content: string; editsCount: number; createdAt: string };

const changeTypeClass: Record<string, string> = {
  grammar: "bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-200",
  style: "bg-main/20 text-foreground",
  clarity: "bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200",
  seo: "bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-200",
};

export default function EnhancePage() {
  const [content, setContent] = useState("");
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState(0);
  const [edits, setEdits] = useState<Edit[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedEditId, setExpandedEditId] = useState<string | null>(null);

  const loadDocument = useCallback(async (id: string) => {
    const res = await fetch(`/api/documents/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setContent(data.content);
    setCurrentVersion(data.currentVersion);
    setEdits(data.latestRevision?.edits ?? []);
  }, []);

  const loadRevisions = useCallback(async (id: string) => {
    const res = await fetch(`/api/documents/${id}/revisions`);
    if (!res.ok) return;
    const data = await res.json();
    setRevisions(data.revisions ?? []);
  }, []);

  const loadRevision = useCallback(async (id: string, version: number) => {
    const res = await fetch(`/api/documents/${id}/revisions/${version}`);
    if (!res.ok) return;
    const data = await res.json();
    setContent(data.content);
    setEdits(data.edits ?? []);
    setCurrentVersion(version);
  }, []);

  async function handleEnhance() {
    setError(null);
    setLoading(true);
    try {
      let id = documentId;
      if (!id) {
        const createRes = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        if (!createRes.ok) {
          const err = await createRes.json();
          throw new Error(err.error ?? "Failed to create document");
        }
        const createData = await createRes.json();
        id = createData.id;
        setDocumentId(id);
      }
      const res = await fetch(`/api/documents/${id}/enhance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Enhance failed");
      }
      const data = await res.json();
      setContent(data.content);
      setCurrentVersion(data.version);
      setEdits(data.edits ?? []);
      await loadRevisions(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptReject(editId: string, userAction: "accepted" | "rejected") {
    if (!documentId) return;
    const res = await fetch(`/api/documents/${documentId}/edits/${editId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userAction }),
    });
    if (!res.ok) return;
    setEdits((prev) => prev.map((e) => (e.editId === editId ? { ...e, userAction } : e)));
  }

  async function handleRollback(version: number) {
    if (!documentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${documentId}/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version }),
      });
      if (!res.ok) throw new Error("Rollback failed");
      await loadRevision(documentId, version);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleUndo() {
    if (!documentId || currentVersion <= 0) return;
    await handleRollback(currentVersion - 1);
  }

  async function handleRedo() {
    if (!documentId || currentVersion >= revisions.length - 1) return;
    const nextVer = revisions.find((r) => r.version === currentVersion + 1)?.version;
    if (nextVer != null) await handleRollback(nextVer);
  }

  const canUndo = documentId && currentVersion > 0;
  const canRedo = documentId && revisions.some((r) => r.version === currentVersion + 1);

  return (
    <>
      <div className="border-b-2 border-border bg-secondary-background px-8 py-6 shadow-[var(--shadow)]">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
          Enhance
        </h1>
        <p className="mt-2 text-foreground/80">
          Paste content, get explainable edits with reasoning and confidence. Accept or reject each change. Undo, redo, or rollback to any version.
        </p>
      </div>
      <div className="p-8">
        {error && (
          <div className="mb-6 rounded-[var(--radius-base)] border-2 border-border bg-red-50 p-4 text-red-800 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste or type content to enhance..."
            rows={6}
            className="w-full max-w-2xl rounded-[var(--radius-base)] border-2 border-border bg-background px-3 py-2 text-foreground shadow-[var(--shadow)]"
          />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleEnhance}
              disabled={loading}
              className="rounded-[var(--radius-base)] border-2 border-border bg-main px-6 py-2 font-semibold text-main-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-60"
            >
              {loading ? "Enhancing…" : "Enhance"}
            </button>
            {documentId && (
              <>
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={!canUndo || loading}
                  className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background px-4 py-2 text-sm font-semibold shadow-[var(--shadow)] disabled:opacity-50"
                >
                  Undo
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={!canRedo || loading}
                  className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background px-4 py-2 text-sm font-semibold shadow-[var(--shadow)] disabled:opacity-50"
                >
                  Redo
                </button>
                {revisions.length > 1 && (
                  <select
                    value={currentVersion}
                    onChange={(e) => handleRollback(Number(e.target.value))}
                    className="rounded-[var(--radius-base)] border-2 border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-[var(--shadow)]"
                  >
                    {revisions.map((r) => (
                      <option key={r.version} value={r.version}>
                        v{r.version}
                      </option>
                    ))}
                  </select>
                )}
              </>
            )}
          </div>
        </div>
        {edits.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-[family-name:var(--font-syne)] text-lg font-bold text-foreground">
              {edits.length} change{edits.length !== 1 ? "s" : ""}
            </h2>
            <ul className="space-y-3">
              {edits.map((edit) => (
                <li
                  key={edit.editId}
                  className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-4 shadow-[var(--shadow)]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${changeTypeClass[edit.changeType] ?? ""}`}
                    >
                      {edit.changeType}
                    </span>
                    {edit.userAction != null && (
                      <span className="text-xs text-foreground/70">
                        {edit.userAction === "accepted" ? "✓ Accepted" : "✗ Rejected"}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setExpandedEditId(expandedEditId === edit.editId ? null : edit.editId)}
                      className="ml-auto rounded border border-border px-2 py-1 text-xs font-medium text-foreground"
                    >
                      {expandedEditId === edit.editId ? "Hide" : "Why?"}
                    </button>
                    {edit.userAction == null && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAcceptReject(edit.editId, "accepted")}
                          className="rounded border border-green-600 bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAcceptReject(edit.editId, "rejected")}
                          className="rounded border border-red-600 bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="line-through text-foreground/70">{edit.original}</span>
                    <span className="mx-2">→</span>
                    <span className="text-foreground">{edit.enhanced}</span>
                  </div>
                  {expandedEditId === edit.editId && (
                    <div className="mt-3 rounded border border-border bg-background p-3 text-sm text-foreground/90">
                      <p><strong>Reasoning:</strong> {edit.reasoning}</p>
                      <p>Confidence: {(edit.confidence * 100).toFixed(0)}%</p>
                      {edit.impactPrediction && <p>Impact: {edit.impactPrediction}</p>}
                      {edit.sources?.length ? (
                        <p>Sources: {edit.sources.join(", ")}</p>
                      ) : null}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
