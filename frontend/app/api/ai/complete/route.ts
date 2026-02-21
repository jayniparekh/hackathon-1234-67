import { NextResponse } from "next/server";
import { getCompletions } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { text?: string };
    const text = typeof body.text === "string" ? body.text : "";
    if (!text.trim()) return NextResponse.json({ suggestions: [] });
    const suggestions = await getCompletions(text);
    return NextResponse.json({ suggestions });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ suggestions: [] });
  }
}
