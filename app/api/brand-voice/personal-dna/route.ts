/**
 * POST /api/brand-voice/personal-dna  — extract & save personal Style DNA
 * GET  /api/brand-voice/personal-dna  — list saved personal DNA profiles
 */

import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/ai";
import { personalDNAStore, type StyleDNA } from "@/lib/personal-dna-store";

interface ContentInput {
    source: string; // "instagram" | "diary" | "whatsapp" | "captions" | "other"
    text: string;
}

export async function POST(req: NextRequest) {
    try {
        const { profile_name, contents } = (await req.json()) as {
            profile_name: string;
            contents: ContentInput[];
        };

        if (!profile_name?.trim()) {
            return NextResponse.json({ error: "profile_name is required" }, { status: 422 });
        }
        const valid = (contents ?? []).filter((c) => c?.text?.trim().length > 20);
        if (valid.length === 0) {
            return NextResponse.json({ error: "Paste at least one piece of content (20+ characters)" }, { status: 422 });
        }

        // Build corpus with source labels
        const corpus = valid
            .map((c, i) => `[SOURCE: ${c.source.toUpperCase()}] SAMPLE ${i + 1}:\n${c.text.trim()}`)
            .join("\n\n---\n\n");

        const prompt = `You are a writing style analyst. Analyze the personal content samples below and extract a precise Style DNA fingerprint.

${corpus}

Compute these signals yourself from the text:
- avg_sentence_length: average word count per sentence (number)
- emoji_usage_per_100_words: how many emojis appear per 100 words (number, can be 0)
- top_emojis: up to 5 most frequently used emojis (array of strings, [] if none)
- exclamation_density: exclamation marks per sentence (number)
- ellipsis_usage: ellipsis (...) per sentence (number)
- caps_frequency: fraction of words in ALL CAPS (0.0-1.0)
- dna_score_baseline: how consistent is this person's style across samples? (0-100)

Use model judgment for these:
- opener_style: one of "question" | "emoji-first" | "statement" | "hashtag" | "mixed"
- humor_style: one of "self-deprecating" | "dry" | "sarcastic" | "wholesome" | "none"
- vocab_complexity: one of "simple" | "everyday" | "expressive" | "literary"
- emotional_tone: one of "positive" | "nostalgic" | "energetic" | "introspective" | "mixed"
- overused_words: top 10 words they use disproportionately (exclude stop words like "the", "a", "is")
- recurring_themes: up to 8 recurring topics/themes (e.g. "coffee", "travel", "gym")
- people_mentioned: array of {name, relationship} objects for people mentioned ([] if none)
- places_mentioned: up to 6 places mentioned ([] if none)
- style_notes: 2-3 sentences describing their unique voice in plain English

Return ONLY valid JSON (no markdown fences) matching this exact schema:
{
  "avg_sentence_length": <number>,
  "emoji_usage_per_100_words": <number>,
  "top_emojis": ["<emoji>"],
  "exclamation_density": <number>,
  "ellipsis_usage": <number>,
  "caps_frequency": <number 0-1>,
  "dna_score_baseline": <number 0-100>,
  "opener_style": "<question|emoji-first|statement|hashtag|mixed>",
  "humor_style": "<self-deprecating|dry|sarcastic|wholesome|none>",
  "vocab_complexity": "<simple|everyday|expressive|literary>",
  "emotional_tone": "<positive|nostalgic|energetic|introspective|mixed>",
  "overused_words": ["<word>"],
  "recurring_themes": ["<theme>"],
  "people_mentioned": [{"name": "<name>", "relationship": "<relationship>"}],
  "places_mentioned": ["<place>"],
  "style_notes": "<narrative>"
}`;

        const data = await generateJSON<Omit<StyleDNA, "name" | "content_count" | "created_at">>(prompt);

        const dna: StyleDNA = {
            name: profile_name.trim(),
            ...data,
            content_count: valid.length,
            created_at: new Date().toISOString(),
        };

        personalDNAStore.save(dna);

        return NextResponse.json({ success: true, dna, message: `Style DNA '${dna.name}' extracted from ${valid.length} piece(s).` });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: `DNA extraction failed: ${msg}` }, { status: 500 });
    }
}

export async function GET() {
    const profiles = personalDNAStore.list().map((d) => ({
        name: d.name,
        content_count: d.content_count,
        top_emojis: d.top_emojis,
        emotional_tone: d.emotional_tone,
        recurring_themes: d.recurring_themes,
        style_notes: d.style_notes,
        created_at: d.created_at,
    }));
    return NextResponse.json({ profiles, total: profiles.length });
}
