"use client";

import { useState, useCallback } from "react";
import {
    Dna,
    ChartBar,
    Sparkle,
    Warning,
    CircleNotch,
    CheckCircle,
    Check,
    Clipboard,
    XCircle,
    UserCircle,
    PenNib,
    Robot,
    ArrowRight,
    Tag,
    SmileyWink,
    TextT,
} from "@phosphor-icons/react";

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

// ── Personal DNA Types ────────────────────────────────────────────────────────
interface StyleDNA {
    name: string;
    avg_sentence_length: number;
    emoji_usage_per_100_words: number;
    top_emojis: string[];
    exclamation_density: number;
    ellipsis_usage: number;
    caps_frequency: number;
    opener_style: string;
    humor_style: string;
    vocab_complexity: string;
    emotional_tone: string;
    overused_words: string[];
    recurring_themes: string[];
    people_mentioned: Array<{ name: string; relationship: string }>;
    places_mentioned: string[];
    dna_score_baseline: number;
    style_notes: string;
    content_count: number;
}

interface CaptionResult {
    caption: string;
    original_caption: string | null;
    dna_match: number;
    original_score: number;
    was_rewritten: boolean;
    match_notes: string[];
    deviations: string[];
    platform: string;
    topic: string;
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
    const [tab, setTab] = useState<"builder" | "scorer" | "correct" | "personal">("builder");

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

    // Personal DNA state
    const [dnaName, setDnaName] = useState("");
    const [dnaContents, setDnaContents] = useState([
        { source: "instagram", text: "" },
        { source: "diary", text: "" },
        { source: "whatsapp", text: "" },
    ]);
    const [extractingDNA, setExtractingDNA] = useState(false);
    const [extractedDNA, setExtractedDNA] = useState<StyleDNA | null>(null);
    const [dnaError, setDnaError] = useState("");
    const [dnaProfiles, setDnaProfiles] = useState<StyleDNA[]>([]);
    const [selectedDNA, setSelectedDNA] = useState("");
    const [captionTopic, setCaptionTopic] = useState("");
    const [captionPlatform, setCaptionPlatform] = useState<"instagram" | "twitter" | "linkedin" | "generic">("instagram");
    const [generatingCaption, setGeneratingCaption] = useState(false);
    const [captionResult, setCaptionResult] = useState<CaptionResult | null>(null);
    const [captionError, setCaptionError] = useState("");

    // Load profiles from API
    const loadProfiles = useCallback(async () => {
        const r = await fetch("/api/brand-voice/profile");
        const d = await r.json();
        setProfiles(d.profiles ?? []);
    }, []);

    const loadDNAProfiles = useCallback(async () => {
        const r = await fetch("/api/brand-voice/personal-dna");
        const d = await r.json();
        setDnaProfiles(d.profiles ?? []);
    }, []);

    const handleTabChange = (t: "builder" | "scorer" | "correct" | "personal") => {
        setTab(t);
        if (t === "scorer" || t === "correct") loadProfiles();
        if (t === "personal") loadDNAProfiles();
    };

    const handleExtractDNA = async () => {
        setDnaError("");
        setExtractedDNA(null);
        if (!dnaName.trim()) return setDnaError("Profile name is required.");
        const valid = dnaContents.filter((c) => c.text.trim().length > 20);
        if (valid.length === 0) return setDnaError("Paste at least one content sample (20+ characters).");
        setExtractingDNA(true);
        try {
            const r = await fetch("/api/brand-voice/personal-dna", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ profile_name: dnaName.trim(), contents: valid }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error ?? "Unknown error");
            setExtractedDNA(d.dna as StyleDNA);
            setSelectedDNA(d.dna.name);
            loadDNAProfiles();
        } catch (e: unknown) {
            setDnaError(e instanceof Error ? e.message : String(e));
        } finally {
            setExtractingDNA(false);
        }
    };

    const handleGenerateCaption = async () => {
        setCaptionError("");
        setCaptionResult(null);
        if (!selectedDNA) return setCaptionError("Select a Style DNA profile first.");
        if (!captionTopic.trim()) return setCaptionError("Enter a topic or context for the caption.");
        setGeneratingCaption(true);
        try {
            const r = await fetch("/api/brand-voice/personal-caption", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dna_name: selectedDNA, topic: captionTopic, platform: captionPlatform }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error ?? "Unknown error");
            setCaptionResult(d.result as CaptionResult);
        } catch (e: unknown) {
            setCaptionError(e instanceof Error ? e.message : String(e));
        } finally {
            setGeneratingCaption(false);
        }
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
        { key: "builder", label: "Brand Builder", Icon: Dna },
        { key: "scorer", label: "Brand Scorer", Icon: ChartBar },
        { key: "correct", label: "Auto-Correct", Icon: Sparkle },
        { key: "personal", label: "Personal DNA", Icon: UserCircle },
    ] as const;

    return (
        <div className="flex min-h-screen flex-col">
            {/* Page header */}
            <div className="border-b-2 border-border bg-secondary-background px-8 py-6 shadow-[var(--shadow)]">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-base)] border-2 border-border bg-main text-main-foreground shadow-[var(--shadow)]">
                        <Dna size={28} weight="duotone" />
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
                    {tabs.map(({ key, label, Icon }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => handleTabChange(key)}
                            className={`flex items-center gap-2 rounded-[var(--radius-base)] border-2 border-border px-4 py-2 text-sm font-semibold shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${tab === key
                                ? "bg-main text-main-foreground"
                                : "bg-background text-foreground"
                                }`}
                        >
                            <Icon size={18} weight="duotone" />
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
                            <div className="flex items-center gap-2 rounded-[var(--radius-base)] border-2 border-[#FF4D50] bg-[#FF4D50]/10 px-4 py-3 text-sm font-semibold text-[#FF4D50]">
                                <Warning size={20} weight="fill" />
                                {buildError}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleBuild}
                            disabled={building}
                            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-base)] border-2 border-border bg-main px-6 py-3 font-bold text-main-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {building ? (
                                <>
                                    <CircleNotch size={20} weight="bold" className="animate-spin" />
                                    Extracting brand DNA via AI...
                                </>
                            ) : (
                                <>
                                    <Dna size={20} weight="duotone" />
                                    Extract Brand Voice Profile
                                </>
                            )}
                        </button>

                        {/* Profile result card */}
                        {builtProfile && (
                            <div className="rounded-[var(--radius-base)] border-2 border-[#05E17A] bg-secondary-background p-6 shadow-[var(--shadow)] space-y-5">
                                <div className="flex items-center gap-3">
                                    <CheckCircle size={28} weight="fill" className="text-[#05E17A] shrink-0" />
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

                                <p className="flex items-center gap-1.5 text-xs text-[#05E17A] font-semibold">
                                    <Check size={14} weight="bold" />
                                    Profile saved — switch to Brand Scorer or Auto-Correct to use it.
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
                            <div className="flex items-center gap-2 rounded-[var(--radius-base)] border-2 border-[#FF4D50] bg-[#FF4D50]/10 px-4 py-3 text-sm font-semibold text-[#FF4D50]">
                                <Warning size={20} weight="fill" />
                                {scoreError}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleScore}
                            disabled={scoring}
                            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-base)] border-2 border-border bg-main px-6 py-3 font-bold text-main-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {scoring ? (
                                <>
                                    <CircleNotch size={20} weight="bold" className="animate-spin" />
                                    Scoring via AI...
                                </>
                            ) : (
                                <>
                                    <ChartBar size={20} weight="duotone" />
                                    Score Brand Match
                                </>
                            )}
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
                                        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground/40">
                                            <CheckCircle size={14} weight="fill" className="text-[#05E17A]" />
                                            Strengths
                                        </p>
                                        <ul className="space-y-1">
                                            {scoreResult.strengths.map((s, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                                    <CheckCircle size={14} weight="fill" className="mt-0.5 shrink-0 text-[#05E17A]" /> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Deviations */}
                                {scoreResult.deviations.length > 0 && (
                                    <div>
                                        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground/40">
                                            <Warning size={14} weight="fill" className="text-[#FF4D50]" />
                                            Deviations
                                        </p>
                                        <ul className="space-y-1">
                                            {scoreResult.deviations.map((d, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                                    <Warning size={14} weight="fill" className="mt-0.5 shrink-0 text-[#FF4D50]" /> {d}
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
                            <div className="flex items-center gap-2 rounded-[var(--radius-base)] border-2 border-[#FF4D50] bg-[#FF4D50]/10 px-4 py-3 text-sm font-semibold text-[#FF4D50]">
                                <Warning size={20} weight="fill" />
                                {correctError}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleCorrect}
                            disabled={correcting}
                            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-base)] border-2 border-border bg-main px-6 py-3 font-bold text-main-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {correcting ? (
                                <>
                                    <CircleNotch size={20} weight="bold" className="animate-spin" />
                                    Rewriting via AI...
                                </>
                            ) : (
                                <>
                                    <Sparkle size={20} weight="duotone" />
                                    Auto-Correct to Brand Voice
                                </>
                            )}
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
                                            <span className="inline-flex items-center gap-1 rounded-[var(--radius-base)] border-2 border-[#FF4D50] bg-[#FF4D50]/10 px-2 py-0.5 text-xs font-bold text-[#FF4D50]">
                                                <XCircle size={14} weight="fill" />
                                                Original · {correctResult.original_score}% match
                                            </span>
                                        </div>
                                        <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                                            {correctResult.original_text}
                                        </p>
                                    </div>
                                    <div className="rounded-[var(--radius-base)] border-2 border-[#05E17A] bg-secondary-background p-5 shadow-[var(--shadow)]">
                                        <div className="mb-3 flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1 rounded-[var(--radius-base)] border-2 border-[#05E17A] bg-[#05E17A]/10 px-2 py-0.5 text-xs font-bold text-[#05E17A]">
                                                <CheckCircle size={14} weight="fill" />
                                                Corrected · {correctResult.corrected_score}% match
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
                                    className="flex items-center gap-2 rounded-[var(--radius-base)] border-2 border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                                >
                                    <Clipboard size={18} weight="duotone" />
                                    Copy corrected text
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ───────── PERSONAL DNA ───────── */}
                {tab === "personal" && (
                    <div className="mx-auto max-w-4xl space-y-6">

                        {/* Intro Banner */}
                        <div className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-5 shadow-[var(--shadow)]">
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-base)] border-2 border-border bg-main text-main-foreground shadow-[var(--shadow)]">
                                    <UserCircle size={22} weight="duotone" />
                                </div>
                                <div>
                                    <h2 className="font-[family-name:var(--font-syne)] text-lg font-bold text-foreground">Personal Style DNA</h2>
                                    <p className="mt-0.5 text-sm text-foreground/60">
                                        Paste your Instagram captions, diary entries, or WhatsApp messages → AI extracts your unique writing fingerprint → generate captions that sound exactly like <em>you</em>.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Saved profiles selector */}
                        {dnaProfiles.length > 0 && (
                            <div className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-5 shadow-[var(--shadow)]">
                                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/40">Saved Style DNA Profiles</p>
                                <div className="flex flex-wrap gap-2">
                                    {dnaProfiles.map((p) => (
                                        <button
                                            key={p.name}
                                            type="button"
                                            onClick={() => setSelectedDNA(p.name)}
                                            className={`rounded-[var(--radius-base)] border-2 px-3 py-1.5 text-sm font-semibold shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${selectedDNA === p.name ? "border-main bg-main text-main-foreground" : "border-border bg-background text-foreground"
                                                }`}
                                        >
                                            <span className="mr-1">{p.top_emojis?.[0] ?? "🧬"}</span> {p.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* DNA Intake form */}
                        <div className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-6 shadow-[var(--shadow)] space-y-5">
                            <h2 className="font-[family-name:var(--font-syne)] text-lg font-bold text-foreground">Extract Your Style DNA</h2>
                            <div>
                                <label className="mb-1 block text-xs font-bold text-foreground/50">Profile Name</label>
                                <input
                                    className="w-full rounded-[var(--radius-base)] border-2 border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-[var(--shadow)] outline-none placeholder:text-foreground/30 focus:ring-2 focus:ring-main"
                                    placeholder="e.g. My Insta Voice, Personal Blog Me"
                                    value={dnaName}
                                    onChange={(e) => setDnaName(e.target.value)}
                                />
                            </div>
                            {dnaContents.map((c, i) => (
                                <div key={i}>
                                    <div className="mb-1 flex items-center gap-2">
                                        <select
                                            className="rounded-[var(--radius-base)] border-2 border-border bg-background px-2 py-1 text-xs font-bold text-foreground shadow-[var(--shadow)] outline-none"
                                            value={c.source}
                                            onChange={(e) => {
                                                const next = [...dnaContents];
                                                next[i] = { ...next[i], source: e.target.value };
                                                setDnaContents(next);
                                            }}
                                        >
                                            <option value="instagram">📸 Instagram Captions</option>
                                            <option value="diary">📔 Diary / Journal</option>
                                            <option value="whatsapp">💬 WhatsApp / Texts</option>
                                            <option value="twitter">🐦 Twitter / X Posts</option>
                                            <option value="other">✍️ Other Writing</option>
                                        </select>
                                        <span className="text-xs font-bold text-foreground/40">Sample {i + 1}</span>
                                        {i > 0 && (
                                            <button type="button" onClick={() => setDnaContents(dnaContents.filter((_, j) => j !== i))} className="ml-auto text-xs text-foreground/30 hover:text-[#FF4D50]">remove</button>
                                        )}
                                    </div>
                                    <textarea
                                        rows={4}
                                        className="w-full rounded-[var(--radius-base)] border-2 border-border bg-background px-4 py-2.5 text-sm text-foreground shadow-[var(--shadow)] outline-none placeholder:text-foreground/30 focus:ring-2 focus:ring-main resize-none"
                                        placeholder={c.source === "instagram" ? "Paste your Instagram captions here..." : c.source === "diary" ? "Paste diary or journal entries..." : "Paste your messages or texts..."}
                                        value={c.text}
                                        onChange={(e) => {
                                            const next = [...dnaContents];
                                            next[i] = { ...next[i], text: e.target.value };
                                            setDnaContents(next);
                                        }}
                                    />
                                </div>
                            ))}
                            <button type="button" onClick={() => setDnaContents([...dnaContents, { source: "other", text: "" }])} className="text-xs font-semibold text-foreground/50 underline hover:text-foreground">
                                + Add another sample
                            </button>
                        </div>

                        {dnaError && (
                            <div className="flex items-center gap-2 rounded-[var(--radius-base)] border-2 border-[#FF4D50] bg-[#FF4D50]/10 px-4 py-3 text-sm font-semibold text-[#FF4D50]">
                                <Warning size={20} weight="fill" /> {dnaError}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleExtractDNA}
                            disabled={extractingDNA}
                            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-base)] border-2 border-border bg-main px-6 py-3 font-bold text-main-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {extractingDNA ? (
                                <><CircleNotch size={20} weight="bold" className="animate-spin" /> Extracting Style DNA via AI...</>
                            ) : (
                                <><UserCircle size={20} weight="duotone" /> Extract My Style DNA</>
                            )}
                        </button>

                        {/* ── DNA Dashboard ── */}
                        {extractedDNA && (
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-center gap-3 rounded-[var(--radius-base)] border-2 border-[#05E17A] bg-secondary-background px-5 py-4 shadow-[var(--shadow)]">
                                    <CheckCircle size={28} weight="fill" className="text-[#05E17A] shrink-0" />
                                    <div className="flex-1">
                                        <p className="font-[family-name:var(--font-syne)] font-bold text-foreground">{extractedDNA.name}</p>
                                        <p className="text-xs text-foreground/50">{extractedDNA.content_count} sample(s) analysed · DNA baseline consistency: {extractedDNA.dna_score_baseline}%</p>
                                    </div>
                                    <ScoreRing score={extractedDNA.dna_score_baseline} size={60} />
                                </div>

                                {/* Stats row */}
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {[
                                        { label: "Avg sentence", value: `${extractedDNA.avg_sentence_length} words`, Icon: TextT },
                                        { label: "Opener style", value: extractedDNA.opener_style, Icon: PenNib },
                                        { label: "Humor", value: extractedDNA.humor_style, Icon: SmileyWink },
                                        { label: "Vocab", value: extractedDNA.vocab_complexity, Icon: Tag },
                                    ].map(({ label, value, Icon: I }) => (
                                        <div key={label} className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-3 shadow-[var(--shadow)]">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <I size={14} weight="duotone" className="text-main" />
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">{label}</p>
                                            </div>
                                            <p className="text-sm font-bold capitalize text-foreground">{value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Emoji strip */}
                                {extractedDNA.top_emojis.length > 0 && (
                                    <div className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-4 shadow-[var(--shadow)]">
                                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground/40">Your Signature Emojis</p>
                                        <div className="flex flex-wrap gap-2">
                                            {extractedDNA.top_emojis.map((e, i) => (
                                                <span key={i} className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-base)] border-2 border-border bg-background text-2xl shadow-[var(--shadow)]">{e}</span>
                                            ))}
                                            <span className="flex items-center rounded-[var(--radius-base)] border-2 border-border bg-background px-3 text-xs font-bold text-foreground/50 shadow-[var(--shadow)]">
                                                {extractedDNA.emoji_usage_per_100_words.toFixed(1)} per 100 words
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Overused words */}
                                {extractedDNA.overused_words.length > 0 && (
                                    <div className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-4 shadow-[var(--shadow)]">
                                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground/40">Your Signature Words</p>
                                        <div className="flex flex-wrap gap-2">
                                            {extractedDNA.overused_words.map((w) => (
                                                <span key={w} className="rounded-[var(--radius-base)] border-2 border-border bg-main px-3 py-1 text-xs font-bold text-main-foreground">{w}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Context graph */}
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    {extractedDNA.recurring_themes.length > 0 && (
                                        <div className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-4 shadow-[var(--shadow)]">
                                            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground/40">🗺 Themes</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {extractedDNA.recurring_themes.map((t) => (
                                                    <span key={t} className="rounded-sm border border-border bg-background px-2 py-0.5 text-xs font-semibold text-foreground/70">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {extractedDNA.people_mentioned.length > 0 && (
                                        <div className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-4 shadow-[var(--shadow)]">
                                            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground/40">👥 People</p>
                                            <div className="space-y-1">
                                                {extractedDNA.people_mentioned.slice(0, 5).map((p) => (
                                                    <div key={p.name} className="flex items-center gap-1.5 text-xs">
                                                        <span className="font-bold text-foreground">{p.name}</span>
                                                        <span className="text-foreground/40">· {p.relationship}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {extractedDNA.places_mentioned.length > 0 && (
                                        <div className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-4 shadow-[var(--shadow)]">
                                            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground/40">📍 Places</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {extractedDNA.places_mentioned.map((pl) => (
                                                    <span key={pl} className="rounded-sm border border-border bg-background px-2 py-0.5 text-xs font-semibold text-foreground/70">{pl}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Style notes */}
                                <div className="rounded-[var(--radius-base)] border-l-4 border-main bg-main/5 p-4">
                                    <p className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-1">AI's Read on You</p>
                                    <p className="text-sm italic text-foreground/80">{extractedDNA.style_notes}</p>
                                </div>
                            </div>
                        )}

                        {/* ── Caption Generator ── */}
                        <div className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-6 shadow-[var(--shadow)] space-y-4">
                            <h2 className="font-[family-name:var(--font-syne)] text-lg font-bold text-foreground flex items-center gap-2">
                                <Robot size={20} weight="duotone" className="text-main" />
                                Generate Caption in Your Voice
                            </h2>

                            {dnaProfiles.length === 0 && !extractedDNA ? (
                                <div className="rounded-[var(--radius-base)] border-2 border-dashed border-border px-4 py-6 text-center text-sm text-foreground/50">
                                    Extract a Style DNA profile above first.
                                </div>
                            ) : (
                                <>
                                    {/* DNA profile selector for caption */}
                                    {dnaProfiles.length > 0 && (
                                        <div>
                                            <label className="mb-1 block text-xs font-bold text-foreground/50">Use DNA Profile</label>
                                            <div className="flex flex-wrap gap-2">
                                                {dnaProfiles.map((p) => (
                                                    <button
                                                        key={p.name}
                                                        type="button"
                                                        onClick={() => setSelectedDNA(p.name)}
                                                        className={`rounded-[var(--radius-base)] border-2 px-3 py-1.5 text-sm font-semibold shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${selectedDNA === p.name ? "border-main bg-main text-main-foreground" : "border-border bg-background text-foreground"
                                                            }`}
                                                    >
                                                        {p.top_emojis?.[0] ?? "🧬"} {p.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Platform */}
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-foreground/50">Platform</label>
                                        <div className="flex flex-wrap gap-2">
                                            {(["instagram", "twitter", "linkedin", "generic"] as const).map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setCaptionPlatform(p)}
                                                    className={`rounded-[var(--radius-base)] border-2 px-4 py-1.5 text-sm font-semibold shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none capitalize ${captionPlatform === p ? "border-main bg-main text-main-foreground" : "border-border bg-background text-foreground"
                                                        }`}
                                                >
                                                    {p === "instagram" ? "📸" : p === "twitter" ? "🐦" : p === "linkedin" ? "💼" : "✍️"} {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Topic */}
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-foreground/50">Topic / Prompt</label>
                                        <input
                                            className="w-full rounded-[var(--radius-base)] border-2 border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-[var(--shadow)] outline-none placeholder:text-foreground/30 focus:ring-2 focus:ring-main"
                                            placeholder='e.g. "Had an amazing morning run" or "Launching my new product"'
                                            value={captionTopic}
                                            onChange={(e) => setCaptionTopic(e.target.value)}
                                        />
                                    </div>

                                    {captionError && (
                                        <div className="flex items-center gap-2 rounded-[var(--radius-base)] border-2 border-[#FF4D50] bg-[#FF4D50]/10 px-4 py-3 text-sm font-semibold text-[#FF4D50]">
                                            <Warning size={20} weight="fill" /> {captionError}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleGenerateCaption}
                                        disabled={generatingCaption}
                                        className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-base)] border-2 border-border bg-main px-6 py-3 font-bold text-main-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {generatingCaption ? (
                                            <><CircleNotch size={20} weight="bold" className="animate-spin" /> Generating + scoring via AI...</>
                                        ) : (
                                            <><Robot size={20} weight="duotone" /> Generate in My Voice</>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Caption Result */}
                        {captionResult && (
                            <div className="space-y-4">
                                {/* Score banner */}
                                <div className={`flex items-center justify-between rounded-[var(--radius-base)] border-2 px-6 py-4 shadow-[var(--shadow)] ${captionResult.dna_match >= 80 ? "border-[#05E17A] bg-[#05E17A]/10" : "border-[#FACC00] bg-[#FACC00]/10"
                                    }`}>
                                    <div className="flex items-center gap-4">
                                        <ScoreRing score={captionResult.dna_match} size={72} />
                                        <div>
                                            <p className="font-[family-name:var(--font-syne)] text-lg font-extrabold text-foreground">{captionResult.dna_match}% Sounds Like You</p>
                                            {captionResult.was_rewritten && (
                                                <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-foreground/60">
                                                    <ArrowRight size={12} /> Auto-rewritten from {captionResult.original_score}% → {captionResult.dna_match}%
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span className="rounded-[var(--radius-base)] border-2 border-border bg-background px-3 py-1 text-xs font-bold capitalize text-foreground">
                                        {captionResult.platform}
                                    </span>
                                </div>

                                {/* The caption */}
                                <div className="rounded-[var(--radius-base)] border-2 border-[#05E17A] bg-secondary-background p-5 shadow-[var(--shadow)]">
                                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/40">Your Caption</p>
                                    <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">{captionResult.caption}</p>
                                    <button
                                        type="button"
                                        onClick={() => navigator.clipboard.writeText(captionResult.caption)}
                                        className="mt-4 flex items-center gap-2 rounded-[var(--radius-base)] border-2 border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                                    >
                                        <Clipboard size={16} weight="duotone" /> Copy caption
                                    </button>
                                </div>

                                {/* Match notes */}
                                {captionResult.match_notes.length > 0 && (
                                    <div className="rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-4 shadow-[var(--shadow)]">
                                        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground/40">
                                            <CheckCircle size={12} weight="fill" className="text-[#05E17A]" /> Why it sounds like you
                                        </p>
                                        <ul className="space-y-1">
                                            {captionResult.match_notes.map((n, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                                    <CheckCircle size={14} weight="fill" className="mt-0.5 shrink-0 text-[#05E17A]" /> {n}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
}
