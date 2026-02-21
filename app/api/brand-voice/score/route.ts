/**
 * POST /api/brand-voice/score — score content against a brand voice profile
 */

import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/gemini";
import { profileStore } from "@/lib/brand-voice-store";

interface ScoreResult {
    overall_match: number;
    dimension_scores: {
        tone_alignment: number;
        vocabulary_match: number;
        sentence_style: number;
        personality_match: number;
    };
    strengths: string[];
    deviations: string[];
    verdict: string;
}

export async function POST(req: NextRequest) {
    try {
        const { profile_name, text } = await req.json();

        if (!profile_name) {
            return NextResponse.json({ error: "profile_name is required" }, { status: 422 });
        }
        if (!text || text.length < 10) {
            return NextResponse.json({ error: "text must be at least 10 characters" }, { status: 422 });
        }

        const profile = profileStore.get(profile_name);
        if (!profile) {
            return NextResponse.json(
                { error: `Profile '${profile_name}' not found. Create it first.` },
                { status: 404 }
            );
        }

        const prompt = `You are a brand voice expert. Score the content below against this brand voice profile.

BRAND VOICE PROFILE:
${JSON.stringify(profile, null, 2)}

CONTENT TO SCORE:
${text}

Return ONLY valid JSON with this exact schema:
{
  "overall_match": <0-100 integer>,
  "dimension_scores": {
    "tone_alignment": <0-100>,
    "vocabulary_match": <0-100>,
    "sentence_style": <0-100>,
    "personality_match": <0-100>
  },
  "strengths": ["<what matches well 1>", "<what matches well 2>"],
  "deviations": ["<specific deviation 1>", "<specific deviation 2>"],
  "verdict": "<On-brand|Mostly on-brand|Slight drift|Off-brand|Strongly off-brand>"
}`;

        const result = await generateJSON<ScoreResult>(prompt);

        return NextResponse.json({ success: true, profile_name, result });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: `Scoring failed: ${message}` }, { status: 500 });
    }
}
