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
      <div className="border-b border-purple-200/50 bg-gradient-to-br from-white via-purple-50/30 to-orange-50/20 px-8 py-6 shadow-sm">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-slate-900">
          Dashboard
        </h1>
        <p className="mt-2 text-slate-600">
          {user?.name ? `Welcome back, ${user.name}. ` : ""}
          Overview of your content pipeline and recent activity.
        </p>
      </div>
      <div className="p-8 space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded border border-purple-200/50 bg-purple-50/30 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <FileText size={20} weight="duotone" />
              <span className="text-sm font-semibold">Documents</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {isLoading ? "—" : documents.length}
            </p>
          </div>
          <div className="rounded border border-purple-200/50 bg-purple-50/30 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <FileText size={20} weight="duotone" />
              <span className="text-sm font-semibold">Total words</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {isLoading ? "—" : totalWords.toLocaleString()}
            </p>
          </div>
          <div className="rounded border border-purple-200/50 bg-purple-50/30 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <ChartLineUp size={20} weight="duotone" />
              <span className="text-sm font-semibold">Recent</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {isLoading ? "—" : recent.length}
            </p>
          </div>
          <Link
            href="/user/live-editor"
            className="flex items-center justify-between rounded border border-orange-300 bg-orange-500 p-4 text-white shadow-sm transition-colors hover:bg-orange-600"
          >
            <div className="flex items-center gap-2">
              <FilePlus size={20} weight="duotone" />
              <span className="text-sm font-semibold">New document</span>
            </div>
            <ArrowRight size={18} weight="bold" />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded border border-purple-200/50 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Recent documents</h2>
            {isLoading ? (
              <div className="mt-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded bg-purple-100/30"
                  />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">No documents yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {recent.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/user/live-editor/${d.id}`}
                      className="flex items-center gap-3 rounded border border-purple-200/50 bg-purple-50/30 px-4 py-3 text-slate-700 shadow-sm transition-colors hover:bg-purple-100/50"
                    >
                      <FileText size={18} weight="duotone" className="shrink-0 text-slate-600" />
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {d.content?.slice(0, 50) || "Untitled"}
                        {(d.content?.length ?? 0) > 50 ? "…" : ""}
                      </span>
                      <span className="shrink-0 text-xs text-slate-600">
                        {d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : ""}
                      </span>
                      <ArrowRight size={14} weight="bold" className="shrink-0 text-slate-600" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {documents.length > 5 && (
              <Link
                href="/user/live-editor"
                className="mt-4 inline-block text-sm font-semibold text-orange-500 hover:text-orange-600"
              >
                View all documents →
              </Link>
            )}
          </div>

          <div className="rounded border border-purple-200/50 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Quick actions</h2>
            <nav className="mt-4 flex flex-col gap-2">
              <Link
                href="/user/content"
                className="flex items-center gap-3 rounded border border-purple-200/50 bg-purple-50/30 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-purple-100/50"
              >
                <FileText size={18} weight="duotone" />
                Content
              </Link>
              <Link
                href="/user/enhance-edits"
                className="flex items-center gap-3 rounded border border-purple-200/50 bg-purple-50/30 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-purple-100/50"
              >
                <MagicWand size={18} weight="duotone" />
                Enhance
              </Link>
              <Link
                href="/user/strategy-hub"
                className="flex items-center gap-3 rounded border border-purple-200/50 bg-purple-50/30 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-purple-100/50"
              >
                <TrendUp size={18} weight="duotone" />
                Strategy Hub
              </Link>
              <Link
                href="/user/live-editor"
                className="flex items-center gap-3 rounded border border-purple-200/50 bg-purple-50/30 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-purple-100/50"
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
