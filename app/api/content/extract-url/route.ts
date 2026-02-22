import { NextResponse } from "next/server";

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    if (!url || !url.startsWith("http")) return NextResponse.json({ error: "Valid url required" }, { status: 400 });
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; ContentForge/1.0)" }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return NextResponse.json({ error: "Failed to fetch URL" }, { status: 400 });
    const html = await res.text();
    const text = stripHtml(html).slice(0, 50000);
    return NextResponse.json({ text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
