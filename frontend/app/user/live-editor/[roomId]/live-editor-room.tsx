"use client";

import { useEffect, useRef, useState } from "react";
import { LiveObject } from "@liveblocks/client";
import {
  LiveblocksProvider,
  RoomProvider,
  useStorage,
  useMutation,
  useOthers,
  useSelf,
  useStatus,
} from "@/lib/liveblocks";
import { applyEdits } from "@/lib/apply-edits";
import type { EditRecord } from "@/lib/db";
import { UsersThree, Lightning, FloppyDisk, Check } from "@phosphor-icons/react";

function EditorInner({ roomId }: { roomId: string }) {
  const content = useStorage((root: { document?: { content?: string }; get?(k: string): unknown }) => {
    const doc = root?.document ?? (typeof root?.get === "function" ? root.get("document") : undefined);
    const val = doc && typeof doc === "object" && "content" in doc
      ? (doc as { content: string }).content
      : typeof (doc as { get?(k: string): string })?.get === "function"
        ? (doc as { get: (k: string) => string }).get("content")
        : undefined;
    return typeof val === "string" ? val : "";
  });
  const updateContent = useMutation(({ storage }, value: string) => {
    const doc = storage.get("document");
    if (doc) doc.set("content", value);
  }, []);
  const others = useOthers();
  const self = useSelf();
  const status = useStatus();
  const storageContent = content ?? "";
  const [localValue, setLocalValue] = useState(storageContent);
  const pendingUpdate = useRef<string | null>(null);
  const isInitialMount = useRef(true);
  const [suggestions, setSuggestions] = useState<EditRecord[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completions, setCompletions] = useState<string[]>([]);
  const [loadingCompletions, setLoadingCompletions] = useState(false);
  const completionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCompletionTextRef = useRef("");

  useEffect(() => {
    return () => {
      if (completionDebounceRef.current) clearTimeout(completionDebounceRef.current);
    };
  }, []);

  useEffect(() => {
    const fromStorage = content ?? "";
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setLocalValue(fromStorage);
      return;
    }
    if (pendingUpdate.current !== null) {
      if (fromStorage === pendingUpdate.current) {
        pendingUpdate.current = null;
        return;
      }
      setLocalValue(fromStorage);
      pendingUpdate.current = null;
      return;
    }
    setLocalValue((prev) => (prev !== fromStorage ? fromStorage : prev));
  }, [content]);

  const handleSuggest = async () => {
    if (localValue == null) return;
    setLoadingSuggestions(true);
    setSuggestions([]);
    try {
      const res = await fetch(`/api/documents/${roomId}/suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: localValue }),
      });
      const data = await res.json();
      if (data.edits?.length) setSuggestions(data.edits);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const acceptAll = () => {
    if (localValue == null || suggestions.length === 0) return;
    const next = applyEdits(localValue, suggestions);
    setLocalValue(next);
    pendingUpdate.current = next;
    updateContent(next);
    setSuggestions([]);
  };

  const saveToMongo = async () => {
    if (localValue == null) return;
    setSaving(true);
    try {
      await fetch(`/api/documents/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: localValue }),
      });
    } finally {
      setSaving(false);
    }
  };

  if (content === undefined) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-foreground/70">
        Connecting…
      </div>
    );
  }

  const handleChange = (value: string) => {
    setLocalValue(value);
    pendingUpdate.current = value;
    updateContent(value);
    setCompletions([]);
    if (completionDebounceRef.current) clearTimeout(completionDebounceRef.current);
    const trimmed = value.trim();
    if (trimmed.length < 3) return;
    completionDebounceRef.current = setTimeout(() => {
      completionDebounceRef.current = null;
      if (lastCompletionTextRef.current === trimmed) return;
      lastCompletionTextRef.current = trimmed;
      setLoadingCompletions(true);
      fetch("/api/ai/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data.suggestions) && data.suggestions.length > 0)
            setCompletions(data.suggestions);
        })
        .finally(() => {
          setLoadingCompletions(false);
          lastCompletionTextRef.current = "";
        });
    }, 500);
  };

  const applyCompletion = (suggestion: string) => {
    const sep = localValue.length > 0 && !/\s$/.test(localValue) ? " " : "";
    const next = localValue + sep + suggestion;
    setLocalValue(next);
    pendingUpdate.current = next;
    updateContent(next);
    setCompletions([]);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-border bg-secondary-background px-4 py-2">
        <span
          className={`flex items-center gap-1 text-xs font-medium ${
            status === "connected"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-600 dark:text-amber-400"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              status === "connected" ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          {status === "connected" ? "Live" : "Connecting…"}
        </span>
        <span className="flex items-center gap-2 text-xs text-foreground/70">
          <UsersThree size={14} weight="duotone" />
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="rounded bg-main/20 px-1.5 py-0.5 font-medium text-main">
              {self?.info?.name ?? "You"}
            </span>
            {others.map((user) => (
              <span
                key={user.id}
                className="rounded border border-border bg-background px-1.5 py-0.5"
              >
                {user.info?.name ?? "Anonymous"}
              </span>
            ))}
          </span>
        </span>
        <button
          type="button"
          onClick={handleSuggest}
          disabled={loadingSuggestions || !localValue.trim()}
          className="flex items-center gap-1 rounded-[var(--radius-base)] border-2 border-border bg-background px-3 py-1.5 text-xs font-semibold shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50"
        >
          <Lightning size={14} weight="duotone" />
          {loadingSuggestions ? "Loading…" : "Suggest improvements"}
        </button>
        {suggestions.length > 0 && (
          <button
            type="button"
            onClick={acceptAll}
            className="flex items-center gap-1 rounded-[var(--radius-base)] border-2 border-main bg-main px-3 py-1.5 text-xs font-semibold text-main-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
          >
            <Check size={14} weight="duotone" />
            Accept All AI Suggestions
          </button>
        )}
        <button
          type="button"
          onClick={saveToMongo}
          disabled={saving}
          className="ml-auto flex items-center gap-1 rounded-[var(--radius-base)] border-2 border-border bg-background px-3 py-1.5 text-xs font-semibold shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50"
        >
          <FloppyDisk size={14} weight="duotone" />
          {saving ? "Saving…" : "Save to document"}
        </button>
      </div>
      <textarea
        className="min-h-[300px] flex-1 resize-none border-0 bg-background p-4 font-mono text-sm text-foreground outline-none"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Write here… everyone sees changes in real time."
      />
      {(completions.length > 0 || loadingCompletions) && (
        <div className="flex flex-wrap items-center gap-2 border-t-2 border-border bg-secondary-background px-4 py-2">
          {loadingCompletions && (
            <span className="text-xs text-foreground/60">Suggesting…</span>
          )}
          {completions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => applyCompletion(s)}
              className="rounded-md border border-border bg-background px-2.5 py-1 font-mono text-xs text-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LiveEditorRoom({ roomId }: { roomId: string }) {
  const [initialStorage, setInitialStorage] = useState<{
    document: LiveObject<{ content: string }>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/documents/${roomId}`)
      .then((r) => {
        if (!r.ok) {
          setError(r.status === 404 ? "Document not found." : "Failed to load.");
          return null;
        }
        return r.json();
      })
      .then((doc) => {
        if (!doc) return;
        setInitialStorage({
          document: new LiveObject({
            content: typeof doc.content === "string" ? doc.content : "",
          }),
        });
      });
  }, [roomId]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <p className="text-foreground/80">{error}</p>
        <a
          href="/user/live-editor"
          className="mt-4 inline-block text-sm font-semibold text-main underline"
        >
          Back to documents
        </a>
      </div>
    );
  }

  if (!initialStorage) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-foreground/70">
        Loading document…
      </div>
    );
  }

  return (
    <LiveblocksProvider>
      <RoomProvider
        id={roomId}
        initialPresence={{}}
        initialStorage={initialStorage}
      >
        <div className="flex h-[calc(100vh-4rem)] flex-col">
          <EditorInner roomId={roomId} />
        </div>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

export { LiveEditorRoom };
