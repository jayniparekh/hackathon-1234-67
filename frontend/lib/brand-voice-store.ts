/**
 * In-memory Brand Voice Profile Store.
 * Uses a module-level singleton so the store persists across hot-reloads
 * in development and across requests in the same process in production.
 */

export interface ToneDimensions {
    formal: number;
    casual: number;
    persuasive: number;
    empathetic: number;
    authoritative: number;
    humorous: number;
    data_driven: number;
    inspirational: number;
}

export interface BrandVoiceProfile {
    name: string;
    tone_dimensions: ToneDimensions;
    vocabulary_level: "simple" | "conversational" | "professional" | "technical" | "academic";
    avg_sentence_length: "short" | "medium" | "long";
    brand_personality: string[];
    signature_phrases: string[];
    writing_style_notes: string;
    article_count: number;
    created_at: string;
}

// Module-level singleton store
const _store = new Map<string, BrandVoiceProfile>();

export const profileStore = {
    save(profile: BrandVoiceProfile) {
        _store.set(profile.name, profile);
    },
    get(name: string): BrandVoiceProfile | undefined {
        return _store.get(name);
    },
    delete(name: string): boolean {
        return _store.delete(name);
    },
    list(): BrandVoiceProfile[] {
        return Array.from(_store.values());
    },
    names(): string[] {
        return Array.from(_store.keys());
    },
};
