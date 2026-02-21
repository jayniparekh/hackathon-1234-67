/**
 * POST /api/brand-voice/personal-caption
 * Generate a caption/post in the user's personal voice, auto-scored + rewritten if <80%
 */

import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/gemini";
import { personalDNAStore } from "@/lib/personal-dna-store";

export async function POST(req: NextRequest) {
    try {
        const { dna_name, topic, platform, extra_context } = (await req.json()) as {
            dna_name: string;
            topic: string;
            platform: "instagram" | "twitter" | "linkedin" | "generic";
            extra_context?: string;
        };

        if (!dna_name) return NextResponse.json({ error: "dna_name is required" }, { status: 422 });
        if (!topic?.trim()) return NextResponse.json({ error: "topic is required" }, { status: 422 });

        const dna = personalDNAStore.get(dna_name);
        if (!dna) {
            return NextResponse.json({ error: `Style DNA '${dna_name}' not found. Extract it first.` }, { status: 404 });
        }

        const platformGuide: Record<string, string> = {
            instagram: "Instagram caption (can use emojis, hashtags, 150-300 chars preferred)",
            twitter: "Twitter/X post (max 280 chars, punchy and direct)",
            linkedin: "LinkedIn post (professional but personal, 150-400 chars)",
            generic: "general social media post",
        };

        const dnaJSON = JSON.stringify(dna, null, 2);

        // Step 1: Generate caption
        const genPrompt = `You are a personal ghostwriter who perfectly mimics someone's exact writing style.

Here is their Style DNA fingerprint:
${dnaJSON}

Write a ${platformGuide[platform] ?? "social media post"} about: "${topic}"
${extra_context ? `Additional context: ${extra_context}` : ""}

Writing rules — you MUST follow these exactly:
- Match their avg sentence length of ~${Math.round(dna.avg_sentence_length)} words per sentence
- Use emojis at a rate of ~${dna.emoji_usage_per_100_words} per 100 words; their top emojis are: ${dna.top_emojis.join(" ") || "none"}
- Open the post in their "${dna.opener_style}" style
- Reflect their "${dna.humor_style}" humor and "${dna.emotional_tone}" emotional tone
- Use everyday vocabulary matching their "${dna.vocab_complexity}" complexity
- Naturally incorporate 1-2 of their recurring themes if relevant: ${dna.recurring_themes.slice(0, 4).join(", ")}
- Do NOT use words that sound like AI corporate speak

Return ONLY valid JSON:
{
  "caption": "<the generated caption>"
}`;

        const { caption } = await generateJSON<{ caption: string }>(genPrompt);

        // Step 2: Score the generated caption against DNA
        const scorePrompt = `You are a style matching expert. Score how well this caption matches this person's Style DNA fingerprint.

STYLE DNA:
${dnaJSON}

CAPTION:
${caption}

Return ONLY valid JSON:
{
  "dna_match": <0-100 integer>,
  "match_notes": ["<note 1>", "<note 2>"],
  "deviations": ["<deviation 1>"]
}`;

        interface ScoreData { dna_match: number; match_notes: string[]; deviations: string[] }
        const scoreData = await generateJSON<ScoreData>(scorePrompt);
        let finalCaption = caption;
        let finalScore = scoreData.dna_match;
        let wasRewritten = false;

        // Step 3: If score < 80, rewrite
        if (scoreData.dna_match < 80) {
            const rewritePrompt = `This caption scored ${scoreData.dna_match}% against the user's Style DNA. Rewrite it so it sounds MORE like them.

STYLE DNA:
${dnaJSON}

CURRENT CAPTION (${scoreData.dna_match}% match):
${caption}

SPECIFIC ISSUES:
${scoreData.deviations.join("\n")}

Rewrite to score 85%+. Return ONLY valid JSON:
{
  "caption": "<rewritten caption>",
  "changes": ["<what you changed>"]
}`;

            const rewritten = await generateJSON<{ caption: string; changes: string[] }>(rewritePrompt);
            finalCaption = rewritten.caption;
            wasRewritten = true;

            // Quick re-score
            const reScoreData = await generateJSON<ScoreData>(`Score this caption against the DNA. Return ONLY: {"dna_match": <0-100>, "match_notes": [], "deviations": []}

DNA: ${dnaJSON}
CAPTION: ${finalCaption}`);
            finalScore = reScoreData.dna_match ?? scoreData.dna_match + 15;
        }

        return NextResponse.json({
            success: true,
            result: {
                caption: finalCaption,
                original_caption: wasRewritten ? caption : null,
                dna_match: finalScore,
                original_score: scoreData.dna_match,
                was_rewritten: wasRewritten,
                match_notes: scoreData.match_notes,
                deviations: scoreData.deviations,
                platform,
                topic,
            },
        });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: `Caption generation failed: ${msg}` }, { status: 500 });
    }
}
