import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) return NextResponse.json({ error: "file required" }, { status: 400 });
    const name = (file.name || "").toLowerCase();
    if (!name.endsWith(".txt")) return NextResponse.json({ error: "Only .txt files supported" }, { status: 400 });
    const text = await file.text();
    return NextResponse.json({ text: text.slice(0, 50000) });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
