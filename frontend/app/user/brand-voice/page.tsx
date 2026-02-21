"use client";

import { useState, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
interface Profile {
    name: string;
    article_count: number;
    vocabulary_level: string;
    brand_personality: string[];
    writing_style_notes: string;
    created_at: string;
}

interface FullProfile extends Profile {
    tone_dimensions: Record<string, number>;
    avg_sentence_length: string;
    signature_phrases: string[];
}

interface ScoreResult {
    overall_match: number;
    dimension_scores: Record<string, number>;
    strengths: string[];
    deviations: string[];
    verdict: string;
}

interface CorrectResult {
    original_text: string;
    corrected_text: string;
    original_score: number;
    corrected_score: number;
    changes_made: string[];
    explanation: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
    const r = size / 2 - 8;
    const circ = 2 * Math.PI * r;
    const progress = (score / 100) * circ;
    const color =
        score >= 80 ? "#05E17A" : score >= 60 ? "#FACC00" : score >= 40 ? "#FF8C00" : "#FF4D50";

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={6} className="opacity-10" />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={6}
                strokeDasharray={`${progress} ${circ - progress}`}
                strokeDashoffset={circ / 4}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 0.6s ease" }}
            />
            <text
                x={size / 2}
                y={size / 2 + 5}
                textAnchor="middle"
                fontSize={size * 0.22}
                fontWeight="bold"
                fill={color}
            >
                {score}%
            </text>
        </svg>
    );
}

function DimBar({ label, value }: { label: string; value: number }) {
    const pct = Math.round(value * 100);
    const color =
        pct >= 70 ? "#05E17A" : pct >= 40 ? "#FACC00" : "#FF4D50";
    return (
        <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-semibold">
                <span className="capitalize text-foreground/70">{label.replace(/_/g, " ")}</span>
                <span style={{ color }}>{pct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-border/30">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}

function ScoreDimBar({ label, value }: { label: string; value: number }) {
    const color =
        value >= 70 ? "#05E17A" : value >= 50 ? "#FACC00" : "#FF4D50";
    return (
        <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-semibold">
                <span className="capitalize text-foreground/70">{label.replace(/_/g, " ")}</span>
                <span style={{ color }}>{value}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-border/30">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${value}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function BrandVoicePage() {
    const [tab, setTab] = useState<"builder" | "scorer" | "correct">("builder");

    // Builder state
    const [profileName, setProfileName] = useState("");
    const [articles, setArticles] = useState(["", "", ""]);
    const [building, setBuilding] = useState(false);
    const [builtProfile, setBuiltProfile] = useState<FullProfile | null>(null);
    const [buildError, setBuildError] = useState("");

    // Scorer state
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [selectedProfile, setSelectedProfile] = useState("");
    const [scoreText, setScoreText] = useState("");
    const [scoring, setScoring] = useState(false);
    const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
    const [scoreError, setScoreError] = useState("");

    // Correct state
    const [correctProfile, setCorrectProfile] = useState("");
    const [correctText, setCorrectText] = useState("");
    const [correcting, setCorrecting] = useState(false);
    const [correctResult, setCorrectResult] = useState<CorrectResult | null>(null);
    const [correctError, setCorrectError] = useState("");

    // Load profiles from API
    const loadProfiles = useCallback(async () => {
        const r = await fetch("/api/brand-voice/profile");
        const d = await r.json();
        setProfiles(d.profiles ?? []);
    }, []);

    const handleTabChange = (t: "builder" | "scorer" | "correct") => {
        setTab(t);
        if (t === "scorer" || t === "correct") loadProfiles();
    };

    // ── Builder ────────────────────────────────────────────────────────────────
    const handleBuild = async () => {
        setBuildError("");
        setBuiltProfile(null);
        const nonEmpty = articles.filter((a) => a.trim().length > 20);
        if (!profileName.trim()) return setBuildError("Profile name is required.");
        if (nonEmpty.length === 0) return setBuildError("Paste at least one article (20+ characters).");
        setBuilding(true);
        try {
            const r = await fetch("/api/brand-voice/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ profile_name: profileName.trim(), articles: nonEmpty }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error ?? "Unknown error");
            setBuiltProfile(d.profile as FullProfile);
        } catch (e: unknown) {
            setBuildError(e instanceof Error ? e.message : String(e));
        } finally {
            setBuilding(false);
        }
    };

    // ── Scorer ─────────────────────────────────────────────────────────────────
    const handleScore = async () => {
        setScoreError("");
        setScoreResult(null);
        if (!selectedProfile) return setScoreError("Select a brand profile first.");
        if (!scoreText.trim() || scoreText.length < 10) return setScoreError("Enter at least 10 characters of text.");
        setScoring(true);
        try {
            const r = await fetch("/api/brand-voice/score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ profile_name: selectedProfile, text: scoreText }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error ?? "Unknown error");
            setScoreResult(d.result as ScoreResult);
        } catch (e: unknown) {
            setScoreError(e instanceof Error ? e.message : String(e));
        } finally {
            setScoring(false);
        }
    };

    // ── Auto-correct ────────────────────────────────────────────────────────────
    const handleCorrect = async () => {
        setCorrectError("");
        setCorrectResult(null);
        if (!correctProfile) return setCorrectError("Select a brand profile first.");
        if (!correctText.trim() || correctText.length < 10) return setCorrectError("Enter at least 10 characters of text.");
        setCorrecting(true);
        try {
            const r = await fetch("/api/brand-voice/correct", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ profile_name: correctProfile, text: correctText }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error ?? "Unknown error");
            setCorrectResult(d.result as CorrectResult);
        } catch (e: unknown) {
            setCorrectError(e instanceof Error ? e.message : String(e));
        } finally {
            setCorrecting(false);
        }
    };

    const verdictColor = (v: string) => {
        if (v.toLowerCase().includes("on-brand") && !v.toLowerCase().includes("mostly")) return "#05E17A";
        if (v.toLowerCase().includes("mostly")) return "#FACC00";
        if (v.toLowerCase().includes("slight")) return "#FF8C00";
        return "#FF4D50";
    };

    const tabs = [
        { key: "builder", label: "🧬 Brand Builder" },
        { key: "scorer", label: "📊 Brand Scorer" },
        { key: "correct", label: "✨ Auto-Correct" },
    ] as const;

    return (
        <div className="flex min-h-screen flex-col">
            {/* Page header */}
            <div className="border-b-2 border-border bg-secondary-background px-8 py-6 shadow-[var(--shadow)]">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-base)] border-2 border-border bg-main text-xl font-bold text-main-foreground shadow-[var(--shadow)]">
                        🧬
                    </div>
                    <div>
                        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
                            Brand Voice DNA
                        </h1>
                        <p className="mt-1 text-sm text-foreground/70">
                            Upload your articles → extract your brand&apos;s writing DNA → score &amp; auto-correct any content.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-6 flex gap-2">
                    {tabs.map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => handleTabChange(key)}
                            className={`rounded-[var(--radius-base)] border-2 border-border px-4 py-2 text-sm font-semibold shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${tab === key
                                    ? "bg-main text-main-foreground"
                                    : "bg-background text-foreground"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-auto p-8">

                {/* ───────── BUILDER ───────── */}
                {tab === "builder" && (
                    <div className="mx-auto max-w-3xl space-y-6">
                        <div className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-6 shadow-[var(--shadow)]">
                            <h2 className="font-[family-name:var(--font-syne)] mb-1 text-lg font-bold text-foreground">
                                Step 1 — Name your brand profile
                            </h2>
                            <p className="mb-4 text-sm text-foreground/60">Give it a unique name (e.g. "Nike Blog", "My Startup").</p>
                            <input
                                className="w-full rounded-[var(--radius-base)] border-2 border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-[var(--shadow)] outline-none placeholder:text-foreground/30 focus:ring-2 focus:ring-main"
                                placeholder="e.g. Apple Newsroom"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                            />
                        </div>

                        <div className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-6 shadow-[var(--shadow)]">
                            <h2 className="font-[family-name:var(--font-syne)] mb-1 text-lg font-bold text-foreground">
                                Step 2 — Paste your articles
                            </h2>
                            <p className="mb-4 text-sm text-foreground/60">Paste 1–3 representative articles. More = better accuracy.</p>
                            <div className="space-y-4">
                                {articles.map((a, i) => (
                                    <div key={i}>
                                        <label className="mb-1 block text-xs font-bold text-foreground/50">
                                            Article {i + 1} {i === 0 ? "(required)" : "(optional)"}
                                        </label>
                                        <textarea
                                            rows={5}
                                            className="w-full rounded-[var(--radius-base)] border-2 border-border bg-background px-4 py-2.5 text-sm text-foreground shadow-[var(--shadow)] outline-none placeholder:text-foreground/30 focus:ring-2 focus:ring-main resize-none"
                                            placeholder={i === 0 ? "Paste an article, blog post, or content piece here..." : "Optional: paste another article..."}
                                            value={a}
                                            onChange={(e) => {
                                                const next = [...articles];
                                                next[i] = e.target.value;
                                                setArticles(next);
                                            }}
                                        />
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setArticles([...articles, ""])}
                                    className="text-xs font-semibold text-foreground/50 underline hover:text-foreground"
                                >
                                    + Add another article
                                </button>
                            </div>
                        </div>

                        {buildError && (
                            <div className="rounded-[var(--radius-base)] border-2 border-[#FF4D50] bg-[#FF4D50]/10 px-4 py-3 text-sm font-semibold text-[#FF4D50]">
                                ⚠ {buildError}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleBuild}
                            disabled={building}
                            className="w-full rounded-[var(--radius-base)] border-2 border-border bg-main px-6 py-3 font-bold text-main-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {building ? "⏳ Extracting brand DNA via Gemini..." : "🧬 Extract Brand Voice Profile"}
                        </button>

                        {/* Profile result card */}
                        {builtProfile && (
                            <div className="rounded-[var(--radius-base)] border-2 border-[#05E17A] bg-secondary-background p-6 shadow-[var(--shadow)] space-y-5">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">✅</span>
                                    <div>
                                        <p className="font-[family-name:var(--font-syne)] text-lg font-bold text-foreground">
                                            {builtProfile.name}
                                        </p>
                                        <p className="text-xs text-foreground/50">
                                            Trained on {builtProfile.article_count} article(s) · Vocab: {builtProfile.vocabulary_level} · Sentences: {builtProfile.avg_sentence_length}
                                        </p>
                                    </div>
                                </div>

                                {/* Tone dimensions */}
                                <div>
                                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/40">Tone Dimensions</p>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                        {Object.entries(builtProfile.tone_dimensions).map(([k, v]) => (
                                            <DimBar key={k} label={k} value={v} />
                                        ))}
                                    </div>
                                </div>

                                {/* Personality */}
                                <div>
                                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground/40">Brand Personality</p>
                                    <div className="flex flex-wrap gap-2">
                                        {builtProfile.brand_personality.map((t) => (
                                            <span key={t} className="rounded-[var(--radius-base)] border-2 border-border bg-main px-3 py-1 text-xs font-bold text-main-foreground">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Signature phrases */}
                                {builtProfile.signature_phrases?.length > 0 && (
                                    <div>
                                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground/40">Signature Phrases</p>
                                        <ul className="space-y-1">
                                            {builtProfile.signature_phrases.map((p) => (
                                                <li key={p} className="text-sm text-foreground/70">
                                                    <span className="font-bold text-main">"</span>{p}<span className="font-bold text-main">"</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Style notes */}
                                <div className="rounded-[var(--radius-base)] border-2 border-border bg-background px-4 py-3">
                                    <p className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-1">Style Notes</p>
                                    <p className="text-sm text-foreground/80">{builtProfile.writing_style_notes}</p>
                                </div>

                                <p className="text-xs text-[#05E17A] font-semibold">
                                    ✓ Profile saved — switch to Brand Scorer or Auto-Correct to use it.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* ───────── SCORER ───────── */}
                {tab === "scorer" && (
                    <div className="mx-auto max-w-3xl space-y-6">
                        <div className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-6 shadow-[var(--shadow)]">
                            <h2 className="font-[family-name:var(--font-syne)] mb-4 text-lg font-bold text-foreground">
                                Select Brand Profile
                            </h2>
                            {profiles.length === 0 ? (
                                <div className="rounded-[var(--radius-base)] border-2 border-dashed border-border px-4 py-6 text-center text-sm text-foreground/50">
                                    No profiles yet. Create one in the Brand Builder tab first.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {profiles.map((p) => (
                                        <button
                                            key={p.name}
                                            type="button"
                                            onClick={() => setSelectedProfile(p.name)}
                                            className={`rounded-[var(--radius-base)] border-2 px-4 py-3 text-left shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${selectedProfile === p.name
                                                    ? "border-main bg-main/10"
                                                    : "border-border bg-background"
                                                }`}
                                        >
                                            <p className="font-bold text-foreground">{p.name}</p>
                                            <p className="mt-0.5 text-xs text-foreground/50">
                                                {p.article_count} article(s) · {p.vocabulary_level} vocab
                                            </p>
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {p.brand_personality.slice(0, 3).map((t) => (
                                                    <span key={t} className="rounded-sm bg-border/30 px-1.5 py-0.5 text-[10px] font-semibold text-foreground/60">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-6 shadow-[var(--shadow)]">
                            <h2 className="font-[family-name:var(--font-syne)] mb-4 text-lg font-bold text-foreground">
                                Paste Content to Score
                            </h2>
                            <textarea
                                rows={6}
                                className="w-full rounded-[var(--radius-base)] border-2 border-border bg-background px-4 py-2.5 text-sm text-foreground shadow-[var(--shadow)] outline-none placeholder:text-foreground/30 focus:ring-2 focus:ring-main resize-none"
                                placeholder='e.g. "Our product is revolutionary and will change the world!!!"'
                                value={scoreText}
                                onChange={(e) => setScoreText(e.target.value)}
                            />
                        </div>

                        {scoreError && (
                            <div className="rounded-[var(--radius-base)] border-2 border-[#FF4D50] bg-[#FF4D50]/10 px-4 py-3 text-sm font-semibold text-[#FF4D50]">
                                ⚠ {scoreError}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleScore}
                            disabled={scoring}
                            className="w-full rounded-[var(--radius-base)] border-2 border-border bg-main px-6 py-3 font-bold text-main-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {scoring ? "⏳ Scoring via Gemini..." : "📊 Score Brand Match"}
                        </button>

                        {/* Score result */}
                        {scoreResult && (
                            <div className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-6 shadow-[var(--shadow)] space-y-5">
                                {/* Overall */}
                                <div className="flex items-center gap-6">
                                    <ScoreRing score={scoreResult.overall_match} size={96} />
                                    <div>
                                        <p className="font-[family-name:var(--font-syne)] text-2xl font-extrabold text-foreground">
                                            {scoreResult.overall_match}% Brand Match
                                        </p>
                                        <p
                                            className="mt-1 inline-block rounded-[var(--radius-base)] border-2 border-border px-3 py-1 text-sm font-bold"
                                            style={{
                                                color: verdictColor(scoreResult.verdict),
                                                borderColor: verdictColor(scoreResult.verdict),
                                                backgroundColor: `${verdictColor(scoreResult.verdict)}15`,
                                            }}
                                        >
                                            {scoreResult.verdict}
                                        </p>
                                    </div>
                                </div>

                                {/* Dimension bars */}
                                <div>
                                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/40">Dimension Breakdown</p>
                                    <div className="space-y-3">
                                        {Object.entries(scoreResult.dimension_scores).map(([k, v]) => (
                                            <ScoreDimBar key={k} label={k} value={v} />
                                        ))}
                                    </div>
                                </div>

                                {/* Strengths */}
                                {scoreResult.strengths.length > 0 && (
                                    <div>
                                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground/40">✅ Strengths</p>
                                        <ul className="space-y-1">
                                            {scoreResult.strengths.map((s, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                                    <span className="mt-0.5 text-[#05E17A]">•</span> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Deviations */}
                                {scoreResult.deviations.length > 0 && (
                                    <div>
                                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground/40">⚠ Deviations</p>
                                        <ul className="space-y-1">
                                            {scoreResult.deviations.map((d, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                                    <span className="mt-0.5 text-[#FF4D50]">•</span> {d}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ───────── AUTO-CORRECT ───────── */}
                {tab === "correct" && (
                    <div className="mx-auto max-w-4xl space-y-6">
                        <div className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-6 shadow-[var(--shadow)]">
                            <h2 className="font-[family-name:var(--font-syne)] mb-4 text-lg font-bold text-foreground">
                                Select Brand Profile
                            </h2>
                            {profiles.length === 0 ? (
                                <div className="rounded-[var(--radius-base)] border-2 border-dashed border-border px-4 py-6 text-center text-sm text-foreground/50">
                                    No profiles yet. Create one in the Brand Builder tab first.
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {profiles.map((p) => (
                                        <button
                                            key={p.name}
                                            type="button"
                                            onClick={() => setCorrectProfile(p.name)}
                                            className={`rounded-[var(--radius-base)] border-2 px-4 py-2 text-sm font-semibold shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${correctProfile === p.name
                                                    ? "border-main bg-main text-main-foreground"
                                                    : "border-border bg-background text-foreground"
                                                }`}
                                        >
                                            {p.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-6 shadow-[var(--shadow)]">
                            <h2 className="font-[family-name:var(--font-syne)] mb-4 text-lg font-bold text-foreground">
                                Paste Content to Auto-Correct
                            </h2>
                            <textarea
                                rows={6}
                                className="w-full rounded-[var(--radius-base)] border-2 border-border bg-background px-4 py-2.5 text-sm text-foreground shadow-[var(--shadow)] outline-none placeholder:text-foreground/30 focus:ring-2 focus:ring-main resize-none"
                                placeholder='e.g. "Our product is revolutionary and will CHANGE THE WORLD!!!"'
                                value={correctText}
                                onChange={(e) => setCorrectText(e.target.value)}
                            />
                        </div>

                        {correctError && (
                            <div className="rounded-[var(--radius-base)] border-2 border-[#FF4D50] bg-[#FF4D50]/10 px-4 py-3 text-sm font-semibold text-[#FF4D50]">
                                ⚠ {correctError}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleCorrect}
                            disabled={correcting}
                            className="w-full rounded-[var(--radius-base)] border-2 border-border bg-main px-6 py-3 font-bold text-main-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {correcting ? "⏳ Rewriting via Gemini..." : "✨ Auto-Correct to Brand Voice"}
                        </button>

                        {/* Correction result */}
                        {correctResult && (
                            <div className="space-y-4">
                                {/* Score improvement banner */}
                                <div className="flex items-center justify-between rounded-[var(--radius-base)] border-2 border-[#05E17A] bg-[#05E17A]/10 px-6 py-4 shadow-[var(--shadow)]">
                                    <div className="flex items-center gap-4">
                                        <ScoreRing score={correctResult.original_score} size={64} />
                                        <div className="text-2xl font-bold text-foreground/40">→</div>
                                        <ScoreRing score={correctResult.corrected_score} size={64} />
                                    </div>
                                    <div className="text-right">
                                        <p className="font-[family-name:var(--font-syne)] text-sm font-bold text-foreground/60">Score improvement</p>
                                        <p className="font-[family-name:var(--font-syne)] text-3xl font-extrabold text-[#05E17A]">
                                            +{Math.max(0, correctResult.corrected_score - correctResult.original_score)}%
                                        </p>
                                    </div>
                                </div>

                                {/* Side-by-side */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="rounded-[var(--radius-base)] border-2 border-[#FF4D50] bg-secondary-background p-5 shadow-[var(--shadow)]">
                                        <div className="mb-3 flex items-center gap-2">
                                            <span className="inline-block rounded-[var(--radius-base)] border-2 border-[#FF4D50] bg-[#FF4D50]/10 px-2 py-0.5 text-xs font-bold text-[#FF4D50]">
                                                ❌ Original · {correctResult.original_score}% match
                                            </span>
                                        </div>
                                        <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                                            {correctResult.original_text}
                                        </p>
                                    </div>
                                    <div className="rounded-[var(--radius-base)] border-2 border-[#05E17A] bg-secondary-background p-5 shadow-[var(--shadow)]">
                                        <div className="mb-3 flex items-center gap-2">
                                            <span className="inline-block rounded-[var(--radius-base)] border-2 border-[#05E17A] bg-[#05E17A]/10 px-2 py-0.5 text-xs font-bold text-[#05E17A]">
                                                ✅ Corrected · {correctResult.corrected_score}% match
                                            </span>
                                        </div>
                                        <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                                            {correctResult.corrected_text}
                                        </p>
                                    </div>
                                </div>

                                {/* Changes made */}
                                <div className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-5 shadow-[var(--shadow)]">
                                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/40">Changes Made</p>
                                    <ul className="space-y-2">
                                        {correctResult.changes_made.map((c, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                                <span className="mt-0.5 shrink-0 font-bold text-main">{i + 1}.</span> {c}
                                            </li>
                                        ))}
                                    </ul>
                                    {correctResult.explanation && (
                                        <p className="mt-4 rounded-[var(--radius-base)] border-l-4 border-main bg-main/5 pl-3 text-sm italic text-foreground/70">
                                            {correctResult.explanation}
                                        </p>
                                    )}
                                </div>

                                {/* Copy button */}
                                <button
                                    type="button"
                                    onClick={() => navigator.clipboard.writeText(correctResult.corrected_text)}
                                    className="rounded-[var(--radius-base)] border-2 border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                                >
                                    📋 Copy corrected text
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
