"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Lightning, YoutubeLogo, InstagramLogo } from "@phosphor-icons/react";
import { NICHE_OPTIONS, type TrendItem, type NicheValue } from "@/lib/strategy-config";

type StrategyResult = { angles: string[]; youtubeHook: string; reelConcept: string };

async function fetchTrends(niche: NicheValue): Promise<{ trends: TrendItem[]; cached?: boolean }> {
  const res = await fetch(`/api/get-trends?niche=${encodeURIComponent(niche)}`);
  if (!res.ok) throw new Error("Failed to fetch trends");
  return res.json();
}

async function fetchStrategy(title: string): Promise<StrategyResult> {
  const res = await fetch("/api/generate-strategy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error ?? "Failed to generate strategy");
  }
  return res.json();
}

function TrendCard({ trend }: { trend: TrendItem }) {
  const [expanded, setExpanded] = useState(false);
  const [strategy, setStrategy] = useState<StrategyResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (strategy) { setExpanded(!expanded); return; }
    setLoading(true);
    try {
      const data = await fetchStrategy(trend.title);
      setStrategy(data);
      setExpanded(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[var(--radius-base)] border-2 border-border bg-background p-4 shadow-[var(--shadow)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500" />
            <span className="font-semibold text-foreground">{trend.title}</span>
          </div>
          <p className="mt-1 text-xs text-foreground/60">{trend.source}</p>
          {trend.mentionCount != null && (
            <p className="mt-0.5 text-xs text-foreground/50">
              ~{trend.mentionCount >= 1000 ? `${(trend.mentionCount / 1000).toFixed(1)}k` : trend.mentionCount} mentions
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-base)] border-2 border-main bg-main px-3 py-1.5 text-xs font-semibold text-main-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-60"
        >
          <Lightning size={14} weight="duotone" />
          {loading ? "Generating…" : strategy ? "Show strategy" : "Generate Strategy"}
        </button>
      </div>
      {expanded && strategy && (
        <div className="mt-4 space-y-3 border-t-2 border-border pt-4">
          {strategy.angles.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold text-foreground/80">Content angles</p>
              <ul className="list-inside list-disc space-y-0.5 text-sm text-foreground/90">
                {strategy.angles.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}
          {strategy.youtubeHook && (
            <div className="flex gap-2">
              <YoutubeLogo size={18} weight="fill" className="shrink-0 text-red-500" />
              <div>
                <p className="text-xs font-semibold text-foreground/80">YouTube hook</p>
                <p className="text-sm text-foreground/90">{strategy.youtubeHook}</p>
              </div>
            </div>
          )}
          {strategy.reelConcept && (
            <div className="flex gap-2">
              <InstagramLogo size={18} weight="fill" className="shrink-0 text-pink-500" />
              <div>
                <p className="text-xs font-semibold text-foreground/80">Reel concept</p>
                <p className="text-sm text-foreground/90">{strategy.reelConcept}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StrategyHubPage() {
  const [niche, setNiche] = useState<NicheValue>("tech_ai");
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["trends", niche],
    queryFn: () => fetchTrends(niche),
    staleTime: 60 * 1000,
  });
  const trends = data?.trends ?? [];

  return (
    <>
      <div className="border-b-2 border-border bg-secondary-background px-8 py-6 shadow-[var(--shadow)]">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">Strategy Hub</h1>
        <p className="mt-2 text-foreground/80">
          Live trends turned into content strategies. Pick a niche, then generate hooks and scripts for any trend.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            Niche
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value as NicheValue)}
              className="rounded-[var(--radius-base)] border-2 border-border bg-background px-3 py-2 text-foreground shadow-[var(--shadow)]"
            >
              {NICHE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <span className="flex items-center gap-1.5 text-xs text-foreground/70">
            <span className={`h-2 w-2 rounded-full ${isFetching ? "animate-pulse bg-amber-500" : "bg-emerald-500"}`} />
            {isFetching ? "Updating…" : data?.cached ? "Cached" : "Live"}
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-[var(--radius-base)] border-2 border-border bg-background px-3 py-2 text-sm font-semibold shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>
      <div className="p-8">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-[var(--radius-base)] border-2 border-border bg-secondary-background" />
            ))}
          </div>
        ) : trends.length === 0 ? (
          <p className="text-foreground/70">No trends for this niche. Try another or refresh.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trends.map((trend) => <TrendCard key={trend.id} trend={trend} />)}
          </div>
        )}
      </div>
    </>
  );
}
