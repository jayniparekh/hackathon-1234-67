/**
 * Gemini 2.5 Flash Lite client for Next.js API routes.
 * Uses the @google/generative-ai SDK.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

function getModel() {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing Gemini API key. Set GOOGLE_API_KEY in your .env.local file."
    );
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite-preview-06-17" });
}

export async function generateJSON<T>(prompt: string): Promise<T> {
  const model = getModel();
  const result = await model.generateContent(prompt);
  let raw = result.response.text().trim();
  // Strip accidental markdown fences
  raw = raw.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "");
  return JSON.parse(raw) as T;
}
