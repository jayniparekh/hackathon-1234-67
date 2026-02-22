import { NextRequest, NextResponse } from "next/server";
import { generateStrategyFromTrend } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const context = typeof body?.context === "string" ? body.context : undefined;
    if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });
    const strategy = await generateStrategyFromTrend(title, context);
    return NextResponse.json(strategy);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to generate strategy";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
