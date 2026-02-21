/**
 * POST /api/brand-voice/correct — auto-correct content toward brand voice
 */

import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/gemini";
import { profileStore } from "@/lib/brand-voice-store";

interface ScoreResult {
    overall_match: number;
    dimension_scores: Record<string, number>;
    strengths: string[];
    deviations: string[];
    verdict: string;
}

interface CorrectResult {
    corrected_text: string;
    changes_made: string[];
    explanation: string;
}

async function scoreText(text: string, profileJSON: string): Promise<number> {
    const { generateJSON: gj } = await import("@/lib/gemini");
    const prompt = `You are a brand voice expert. Score the content below against this brand voice profile. Return ONLY valid JSON with schema: {"overall_match": <0-100>}

BRAND VOICE PROFILE: ${profileJSON}
CONTENT: ${text}`;
    try {
        const r = await gj<{ overall_match: number }>(prompt);
        return r.overall_match ?? 0;
    } catch {
        return 0;
    }
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

        const profileJSON = JSON.stringify(profile, null, 2);

        const prompt = `You are a brand voice editor. Rewrite the content below to perfectly match the brand voice profile. Keep the same core meaning and information.

BRAND VOICE PROFILE:
${profileJSON}

ORIGINAL CONTENT:
${text}

Return ONLY valid JSON with this exact schema:
{
  "corrected_text": "<the rewritten content>",
  "changes_made": ["<specific change 1>", "<specific change 2>", "<specific change 3>"],
  "explanation": "<1-2 sentences explaining the overall approach taken>"
}`;

        const correctionData = await generateJSON<CorrectResult>(prompt);

        // Score both versions
        const [originalScore, correctedScore] = await Promise.all([
            scoreText(text, profileJSON),
            scoreText(correctionData.corrected_text, profileJSON),
        ]);

        return NextResponse.json({
            success: true,
            profile_name,
            result: {
                original_text: text,
                corrected_text: correctionData.corrected_text,
                original_score: originalScore,
                corrected_score: correctedScore,
                changes_made: correctionData.changes_made,
                explanation: correctionData.explanation,
            },
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: `Auto-correction failed: ${message}` }, { status: 500 });
    }
}
