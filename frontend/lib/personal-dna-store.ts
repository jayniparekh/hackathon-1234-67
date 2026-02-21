/**
 * In-memory Personal Style DNA Profile Store.
 * Stores extracted writing fingerprints from personal content.
 */

export interface StyleDNA {
    name: string;

    // Quantitative signals
    avg_sentence_length: number;        // mean word count per sentence
    emoji_usage_per_100_words: number;  // emoji density
    top_emojis: string[];               // e.g. ["😂", "✨", "💪"]
    exclamation_density: number;        // exclamations per sentence
    ellipsis_usage: number;             // ellipsis per sentence
    caps_frequency: number;             // % of words in ALL CAPS

    // Qualitative signals (Gemini-extracted)
    opener_style: "question" | "emoji-first" | "statement" | "hashtag" | "mixed";
    humor_style: "self-deprecating" | "dry" | "sarcastic" | "wholesome" | "none";
    vocab_complexity: "simple" | "everyday" | "expressive" | "literary";
    emotional_tone: "positive" | "nostalgic" | "energetic" | "introspective" | "mixed";

    // Word fingerprint
    overused_words: string[];           // top 10 disproportionately frequent words

    // Context graph
    recurring_themes: string[];         // e.g. ["travel", "coffee", "startup life"]
    people_mentioned: Array<{ name: string; relationship: string }>;
    places_mentioned: string[];

    // Style DNA vector baseline (0-100, how similar corpus texts are to each other)
    dna_score_baseline: number;

    // Style notes narrative
    style_notes: string;

    content_count: number;
    created_at: string;
}

// Module-level singleton
const _store = new Map<string, StyleDNA>();

export const personalDNAStore = {
    save(dna: StyleDNA) {
        _store.set(dna.name, dna);
    },
    get(name: string): StyleDNA | undefined {
        return _store.get(name);
    },
    delete(name: string): boolean {
        return _store.delete(name);
    },
    list(): StyleDNA[] {
        return Array.from(_store.values());
    },
};
