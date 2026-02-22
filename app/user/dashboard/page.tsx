"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  FileText,
  FilePlus,
  MagicWand,
  TrendUp,
  PencilLine,
  ArrowRight,
  ChartLineUp,
} from "@phosphor-icons/react";
import { useCurrentUser } from "@/hooks/use-current-user";

type Doc = {
  id: string;
  content: string;
  currentVersion: number;
  updatedAt: string;
};

async function fetchDocuments(): Promise<Doc[]> {
  const res = await fetch("/api/documents");
  if (!res.ok) throw new Error("Failed to fetch documents");
  const data = await res.json();
  return data.documents ?? [];
}

export default function DashboardPage() {
  const { user } = useCurrentUser();
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["dashboard-documents"],
    queryFn: fetchDocuments,
  });

  const recent = documents.slice(0, 5);
  const totalWords = documents.reduce(
    (sum, d) => sum + (d.content?.trim().split(/\s+/).filter(Boolean).length ?? 0),
    0
  );

  return (
    <>
      <div className="border-b-2 border-border bg-secondary-background px-8 py-6 shadow-[var(--shadow)]">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="mt-2 text-foreground/80">
          {user?.name ? `Welcome back, ${user.name}. ` : ""}
          Overview of your content pipeline and recent activity.
        </p>
      </div>
      <div className="p-8 space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[var(--radius-base)] border-2 border-border bg-background p-4 shadow-[var(--shadow)]">
            <div className="flex items-center gap-2 text-foreground/70">
              <FileText size={20} weight="duotone" />
              <span className="text-sm font-semibold">Documents</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {isLoading ? "—" : documents.length}
            </p>
          </div>
          <div className="rounded-[var(--radius-base)] border-2 border-border bg-background p-4 shadow-[var(--shadow)]">
            <div className="flex items-center gap-2 text-foreground/70">
              <FileText size={20} weight="duotone" />
              <span className="text-sm font-semibold">Total words</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {isLoading ? "—" : totalWords.toLocaleString()}
            </p>
          </div>
          <div className="rounded-[var(--radius-base)] border-2 border-border bg-background p-4 shadow-[var(--shadow)]">
            <div className="flex items-center gap-2 text-foreground/70">
              <ChartLineUp size={20} weight="duotone" />
              <span className="text-sm font-semibold">Recent</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {isLoading ? "—" : recent.length}
            </p>
          </div>
          <Link
            href="/user/live-editor"
            className="flex items-center justify-between rounded-[var(--radius-base)] border-2 border-main bg-main p-4 text-main-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
          >
            <div className="flex items-center gap-2">
              <FilePlus size={20} weight="duotone" />
              <span className="text-sm font-semibold">New document</span>
            </div>
            <ArrowRight size={18} weight="bold" />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-[var(--radius-base)] border-2 border-border bg-background p-6 shadow-[var(--shadow)]">
            <h2 className="font-semibold text-foreground">Recent documents</h2>
            {isLoading ? (
              <div className="mt-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded-[var(--radius-base)] bg-secondary-background"
                  />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <p className="mt-4 text-sm text-foreground/60">No documents yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {recent.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/user/live-editor/${d.id}`}
                      className="flex items-center gap-3 rounded-[var(--radius-base)] border-2 border-border bg-secondary-background px-4 py-3 text-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                    >
                      <FileText size={18} weight="duotone" className="shrink-0 text-foreground/70" />
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {d.content?.slice(0, 50) || "Untitled"}
                        {(d.content?.length ?? 0) > 50 ? "…" : ""}
                      </span>
                      <span className="shrink-0 text-xs text-foreground/60">
                        {d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : ""}
                      </span>
                      <ArrowRight size={14} weight="bold" className="shrink-0 text-foreground/50" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {documents.length > 5 && (
              <Link
                href="/user/live-editor"
                className="mt-4 inline-block text-sm font-semibold text-main"
              >
                View all documents →
              </Link>
            )}
          </div>

          <div className="rounded-[var(--radius-base)] border-2 border-border bg-background p-6 shadow-[var(--shadow)]">
            <h2 className="font-semibold text-foreground">Quick actions</h2>
            <nav className="mt-4 flex flex-col gap-2">
              <Link
                href="/user/content"
                className="flex items-center gap-3 rounded-[var(--radius-base)] border-2 border-border px-4 py-3 text-sm font-medium text-foreground transition-[transform,box-shadow] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              >
                <FileText size={18} weight="duotone" />
                Content
              </Link>
              <Link
                href="/user/enhance-edits"
                className="flex items-center gap-3 rounded-[var(--radius-base)] border-2 border-border px-4 py-3 text-sm font-medium text-foreground transition-[transform,box-shadow] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              >
                <MagicWand size={18} weight="duotone" />
                Enhance
              </Link>
              <Link
                href="/user/strategy-hub"
                className="flex items-center gap-3 rounded-[var(--radius-base)] border-2 border-border px-4 py-3 text-sm font-medium text-foreground transition-[transform,box-shadow] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              >
                <TrendUp size={18} weight="duotone" />
                Strategy Hub
              </Link>
              <Link
                href="/user/live-editor"
                className="flex items-center gap-3 rounded-[var(--radius-base)] border-2 border-border px-4 py-3 text-sm font-medium text-foreground transition-[transform,box-shadow] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              >
                <PencilLine size={18} weight="duotone" />
                Live Editor
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
