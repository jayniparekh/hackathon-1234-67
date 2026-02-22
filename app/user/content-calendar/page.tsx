"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarBlank, Lightning, CaretDown, CaretRight } from "@phosphor-icons/react";
import type { CalendarDay } from "@/lib/gemini";

async function fetchProfile(): Promise<Record<string, unknown> | null> {
  const res = await fetch("/api/user/profile");
  const data = await res.json();
  return data?.profile ?? null;
}

async function fetchCalendar(): Promise<CalendarDay[]> {
  const res = await fetch("/api/content-calendar");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Failed to generate calendar");
  }
  const data = await res.json();
  return data?.calendar ?? [];
}

export default function ContentCalendarPage() {
  const [generated, setGenerated] = useState<CalendarDay[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDay, setOpenDay] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchProfile,
  });

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const calendar = await fetchCalendar();
      setGenerated(calendar);
      if (calendar.length > 0) setOpenDay(calendar[0].date);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const niche = profile?.niche as string | undefined;
  const platforms = profile?.platforms as string[] | undefined;
  const platformsLabel = platforms?.length ? platforms.join(", ") : "";
  const postingFrequency = profile?.postingFrequency as string | undefined;
  const contentLength = profile?.contentLengthPreference as string | undefined;
  const audience = (profile?.audienceGen as string) || (profile?.audiencePlatforms as string) || undefined;

  return (
    <>
      <div className="border-b-2 border-border bg-secondary-background px-8 py-6 shadow-[var(--shadow)]">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
          Content Calendar
        </h1>
        <p className="mt-2 text-foreground/80">
          A 15-day content calendar tailored to your niche, platforms, posting frequency, and audience.
        </p>
        {profile && (
          <div className="mt-4 flex flex-wrap gap-2 text-sm text-foreground/70">
            {niche && <span className="rounded border border-border bg-background px-2 py-1">Niche: {niche}</span>}
            {platformsLabel ? <span className="rounded border border-border bg-background px-2 py-1">{"Platforms: " + platformsLabel}</span> : null}
            {postingFrequency && <span className="rounded border border-border bg-background px-2 py-1">Frequency: {postingFrequency}/wk</span>}
            {contentLength && <span className="rounded border border-border bg-background px-2 py-1">Length: {contentLength}</span>}
            {audience && <span className="rounded border border-border bg-background px-2 py-1">Audience: {audience}</span>}
          </div>
        )}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 rounded-[var(--radius-base)] border-2 border-main bg-main px-4 py-2 text-sm font-semibold text-main-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-60"
          >
            <Lightning size={18} weight="duotone" />
            {loading ? "Generating…" : "Generate 15-day calendar"}
          </button>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </div>
      <div className="p-8">
        {!generated ? (
          <div className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-8 text-center text-foreground/70">
            Click &quot;Generate 15-day calendar&quot; to create a personalized content plan from your profile.
          </div>
        ) : (
          <div className="space-y-2">
            {generated.map((day) => {
              const isOpen = openDay === day.date;
              const dateLabel = new Date(day.date + "Z").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
              return (
                <div
                  key={day.date}
                  className="rounded-[var(--radius-base)] border-2 border-border bg-background shadow-[var(--shadow)]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenDay(isOpen ? null : day.date)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="flex items-center gap-2 font-semibold text-foreground">
                      {isOpen ? <CaretDown size={18} weight="bold" /> : <CaretRight size={18} weight="bold" />}
                      <CalendarBlank size={18} weight="duotone" />
                      {dateLabel}
                    </span>
                    <span className="text-sm text-foreground/60">{day.items.length} item{day.items.length !== 1 ? "s" : ""}</span>
                  </button>
                  {isOpen && (
                    <div className="border-t-2 border-border px-4 py-3">
                      {day.items.length === 0 ? (
                        <p className="text-sm text-foreground/60">No content scheduled.</p>
                      ) : (
                        <ul className="space-y-3">
                          {day.items.map((item, i) => (
                            <li key={i} className="rounded border border-border bg-secondary-background p-3">
                              <p className="text-xs font-medium text-foreground/70">{item.platform}{item.contentLength ? ` · ${item.contentLength}` : ""}</p>
                              <p className="mt-1 font-medium text-foreground">{item.title}</p>
                              <p className="mt-1 text-sm text-foreground/80">{item.description}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
