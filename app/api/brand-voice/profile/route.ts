/**
 * POST /api/brand-voice/profile  — create & save a brand voice profile
 * GET  /api/brand-voice/profile  — list all saved profiles
 */

import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/ai";
import { profileStore, BrandVoiceProfile } from "@/lib/brand-voice-store";

export async function POST(req: NextRequest) {
    try {
        const { profile_name, articles } = await req.json();

        if (!profile_name || typeof profile_name !== "string") {
            return NextResponse.json({ error: "profile_name is required" }, { status: 422 });
        }
        if (!Array.isArray(articles) || articles.length === 0) {
            return NextResponse.json({ error: "At least one article is required" }, { status: 422 });
        }

        const corpus = articles
            .slice(0, 10)
            .map((a: string, i: number) => `ARTICLE ${i + 1}:\n${a.trim()}`)
            .join("\n\n---ARTICLE BREAK---\n\n");

        const prompt = `You are a brand voice analyst. Analyze the following articles and extract a precise brand voice DNA profile.

${corpus}

Return ONLY valid JSON (no markdown, no code fences) with this exact schema:
{
  "tone_dimensions": {
    "formal": <0.0-1.0>,
    "casual": <0.0-1.0>,
    "persuasive": <0.0-1.0>,
    "empathetic": <0.0-1.0>,
    "authoritative": <0.0-1.0>,
    "humorous": <0.0-1.0>,
    "data_driven": <0.0-1.0>,
    "inspirational": <0.0-1.0>
  },
  "vocabulary_level": "<simple|conversational|professional|technical|academic>",
  "avg_sentence_length": "<short|medium|long>",
  "brand_personality": ["<trait1>", "<trait2>", "<trait3>"],
  "signature_phrases": ["<phrase1>", "<phrase2>", "<phrase3>"],
  "writing_style_notes": "<2-3 sentence description of the distinctive writing style>"
}`;

        const data = await generateJSON<Omit<BrandVoiceProfile, "name" | "article_count" | "created_at">>(prompt);

        const profile: BrandVoiceProfile = {
            name: profile_name,
            ...data,
            article_count: articles.length,
            created_at: new Date().toISOString(),
        };

        profileStore.save(profile);

        return NextResponse.json({
            success: true,
            profile,
            message: `Profile '${profile_name}' created from ${articles.length} article(s).`,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: `Failed to extract brand DNA: ${message}` }, { status: 500 });
    }
}

export async function GET() {
    const profiles = profileStore.list().map((p) => ({
        name: p.name,
        article_count: p.article_count,
        vocabulary_level: p.vocabulary_level,
        brand_personality: p.brand_personality,
        writing_style_notes: p.writing_style_notes,
        created_at: p.created_at,
    }));

    return NextResponse.json({ profiles, total: profiles.length });
}
