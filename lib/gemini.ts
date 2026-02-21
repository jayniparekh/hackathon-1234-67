import { GoogleGenAI } from "@google/genai";
import type { EditRecord } from "./db";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

export async function generateJSON<T>(prompt: string): Promise<T> {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
  const model = process.env.GEMINI_MODEL ?? "gemini-3-flash-preview";
  const response = await ai.models.generateContent({ model, contents: prompt });
  let raw = (response.text ?? "").trim();
  raw = raw.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "");
  return JSON.parse(raw) as T;
}

export async function getEditsFromContent(
  content: string,
): Promise<EditRecord[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  const model = process.env.GEMINI_MODEL ?? "gemini-3-flash-preview";
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

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  const text = response.text ?? "";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  const jsonStr = jsonMatch ? jsonMatch[0] : text;
  let arr: unknown[];
  try {
    arr = JSON.parse(jsonStr) as unknown[];
  } catch {
    return [];
  }
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
}

const COMPLETION_CONTEXT_WORDS = 120;

export async function getCompletions(text: string): Promise<string[]> {
  if (!process.env.GEMINI_API_KEY) return [];
  const model = process.env.GEMINI_MODEL ?? "gemini-3-flash-preview";
  const words = text.trim().split(/\s+/);
  const context = words.slice(-COMPLETION_CONTEXT_WORDS).join(" ");
  if (!context) return [];
  const prompt = `Suggest 1 to 3 short continuations (next few words or phrase) for this text. Output ONLY a JSON array of strings, no other text. Example: ["option one", "option two"]

Text:
${context}

JSON array:`;
  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    const raw = (response.text ?? "").trim();
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
