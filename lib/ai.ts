import type { EditRecord } from "./db";
import { generateText } from "./llm";

export async function generateJSON<T>(prompt: string): Promise<T> {
  const raw = await generateText(prompt);
  const cleaned = raw.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "");
  return JSON.parse(cleaned) as T;
}

export async function getEditsFromContent(
  content: string,
): Promise<EditRecord[]> {
  const prompt = `You are an expert editor. Analyze the following text and suggest specific, granular improvements. For EACH change you suggest, output one edit.

Rules:
- Split the text into small logical units (phrase or sentence). Suggest at most one edit per unit.
- Each edit must have: original (exact substring from the text), enhanced (improved version), changeType (exactly one of: grammar, style, clarity, seo), reasoning (one sentence why), confidence (number 0 to 1).
- Optionally add impactPrediction (e.g. "+15% engagement") and sources (array of short strings).
- Output ONLY a valid JSON array, no markdown or extra text. Each object must have: editId (unique string, e.g. "e_1"), original, enhanced, changeType, reasoning, confidence.

Text to analyze:
"""
${content.slice(0, 28000)}
"""

JSON array of edits:`;
  try {
    const text = await generateText(prompt);
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    const arr = JSON.parse(jsonStr) as unknown[];
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(
        (x): x is Record<string, unknown> =>
          x !== null &&
          typeof x === "object" &&
          "original" in x &&
          "enhanced" in x,
      )
      .map((x, i) => ({
        editId: typeof x.editId === "string" ? x.editId : `e_${i + 1}`,
        original: String(x.original ?? ""),
        enhanced: String(x.enhanced ?? ""),
        changeType: ["grammar", "style", "clarity", "seo"].includes(
          String(x.changeType),
        )
          ? (x.changeType as EditRecord["changeType"])
          : "clarity",
        reasoning: String(x.reasoning ?? "Improvement suggested."),
        confidence:
          typeof x.confidence === "number"
            ? Math.min(1, Math.max(0, x.confidence))
            : 0.8,
        impactPrediction:
          typeof x.impactPrediction === "string" ? x.impactPrediction : undefined,
        sources: Array.isArray(x.sources) ? x.sources.map(String) : undefined,
        userAction: null,
      }));
  } catch {
    return [];
  }
}

const COMPLETION_CONTEXT_WORDS = 120;

export async function getCompletions(text: string): Promise<string[]> {
  const words = text.trim().split(/\s+/);
  const context = words.slice(-COMPLETION_CONTEXT_WORDS).join(" ");
  if (!context) return [];
  const prompt = `Suggest 1 to 3 short continuations (next few words or phrase) for this text. Output ONLY a JSON array of strings, no other text. Example: ["option one", "option two"]

Text:
${context}

JSON array:`;
  try {
    const raw = await generateText(prompt, 256);
    const arrMatch = raw.match(/\[[\s\S]*?\]/);
    const jsonStr = arrMatch ? arrMatch[0] : raw;
    const out = JSON.parse(jsonStr) as unknown;
    if (!Array.isArray(out)) return [];
    return out
      .filter((x): x is string => typeof x === "string" && x.length > 0)
      .map((s) => String(s).trim())
      .slice(0, 3);
  } catch {
    return [];
  }
}

export type StrategyResult = {
  angles: string[];
  youtubeHook: string;
  reelConcept: string;
};

export async function generateStrategyFromTrend(trendTitle: string, context?: string): Promise<StrategyResult> {
  const prompt = `Act as an elite content strategist. Here is a real-time trend: "${trendTitle}"${context ? `. Context: ${context}` : ""}.

Generate a content strategy for this trend. Output ONLY valid JSON with exactly:
- "angles": array of 3 unique content angles (short strings)
- "youtubeHook": one catchy YouTube hook (opening line)
- "reelConcept": one Instagram Reel concept (1-2 sentences)

No markdown, no code fence. JSON only.`;
  const raw = await generateJSON<StrategyResult>(prompt);
  return {
    angles: Array.isArray(raw?.angles) ? raw.angles.slice(0, 3).map(String) : [],
    youtubeHook: typeof raw?.youtubeHook === "string" ? raw.youtubeHook : "",
    reelConcept: typeof raw?.reelConcept === "string" ? raw.reelConcept : "",
  };
}

export type CalendarItem = {
  platform: string;
  title: string;
  description: string;
  contentLength?: string;
  contentType?: string;
};

export type CalendarDay = {
  date: string;
  items: CalendarItem[];
};

export type ContentCalendarInput = {
  niche?: string;
  platforms?: string[];
  postingFrequency?: string;
  contentLengthPreference?: string;
  audienceGen?: string;
  audiencePlatforms?: string;
  contentTypes?: string[];
  contentGoal?: string;
  experienceLevel?: string;
};

export async function generateContentCalendar(input: ContentCalendarInput): Promise<CalendarDay[]> {
  const start = new Date();
  const days: string[] = [];
  for (let i = 0; i < 15; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  const context = [
    input.niche && `Niche: ${input.niche}`,
    input.platforms?.length && `Platforms: ${input.platforms.join(", ")}`,
    input.postingFrequency && `Posting frequency: ${input.postingFrequency} per week`,
    input.contentLengthPreference && `Content length: ${input.contentLengthPreference}`,
    input.audienceGen && `Target audience: ${input.audienceGen}`,
    input.audiencePlatforms && `Audience platforms: ${input.audiencePlatforms}`,
    input.contentTypes?.length && `Content types: ${input.contentTypes.join(", ")}`,
    input.contentGoal && `Goal: ${input.contentGoal}`,
    input.experienceLevel && `Experience: ${input.experienceLevel}`,
  ]
    .filter(Boolean)
    .join(". ");
  const prompt = `You are an expert content strategist. Create a 15-day content calendar for a creator with these details: ${context || "General creator (use sensible defaults)."}

Generate exactly 15 days starting from ${days[0]}. Each day must have a "date" (YYYY-MM-DD) and "items" (array of content pieces). For each item include: "platform", "title", "description", and optionally "contentLength" and "contentType". Respect posting frequency: if it's "1-2" do 1-2 posts per week spread across days; "3-5" means 3-5 per week; "daily" means at least one per day; "multiple" means multiple per day. Spread content across the creator's platforms. Tailor topics to their niche and audience.

Output ONLY a valid JSON array of 15 objects. Each object: { "date": "YYYY-MM-DD", "items": [ { "platform": "...", "title": "...", "description": "..." } ] }. No markdown, no code fence.`;
  const raw = await generateJSON<CalendarDay[]>(prompt);
  if (!Array.isArray(raw) || raw.length === 0) {
    return days.map((date) => ({ date, items: [] }));
  }
  return raw.slice(0, 15).map((day) => ({
    date: typeof day?.date === "string" ? day.date : "",
    items: Array.isArray(day?.items)
      ? day.items.map((item: Record<string, unknown>) => ({
          platform: String(item?.platform ?? ""),
          title: String(item?.title ?? ""),
          description: String(item?.description ?? ""),
          contentLength: item?.contentLength != null ? String(item.contentLength) : undefined,
          contentType: item?.contentType != null ? String(item.contentType) : undefined,
        }))
      : [],
  }));
}

export type ContentGenerateContext = {
  niche?: string;
  platforms?: string[];
  audienceGen?: string;
  audiencePlatforms?: string;
  contentLengthPreference?: string;
  contentTypes?: string[];
  contentGoal?: string;
};

export async function generateContentFromBrief(
  input: string,
  contentType: string,
  outputFormat: string,
  context: ContentGenerateContext
): Promise<string> {
  const ctx = [
    context.niche && "Niche: " + context.niche,
    context.platforms?.length && "Platforms: " + context.platforms.join(", "),
    context.audienceGen && "Target audience: " + context.audienceGen,
    context.audiencePlatforms && "Audience platforms: " + context.audiencePlatforms,
    context.contentLengthPreference && "Content length: " + context.contentLengthPreference,
    context.contentGoal && "Goal: " + context.contentGoal,
  ]
    .filter(Boolean)
    .join(". ");
  const prompt = `You are an expert content creator. Generate ${contentType} content tailored to the creator's niche and audience.

Creator context: ${ctx || "General audience."}

Content type: ${contentType}. Output format: ${outputFormat}.

Brief or idea from the creator:
"""
${input.slice(0, 8000)}
"""

Generate the full content now in Markdown format: use headers, lists, bold/italic where appropriate. Match the creator's niche, tone for their audience, and preferred length. Output only the markdown content, no meta commentary.`;
  return generateText(prompt, 4096);
}
