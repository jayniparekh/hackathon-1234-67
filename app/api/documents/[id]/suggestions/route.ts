import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/db";
import { getEditsFromContent } from "@/lib/gemini";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await collections.documents().findOne({ _id: new ObjectId(id) });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = (await request.json()) as { content?: string };
    const content = typeof body.content === "string" ? body.content : doc.content;
    if (!content.trim()) return NextResponse.json({ error: "Content is empty" }, { status: 400 });

    const edits = await getEditsFromContent(content);
    return NextResponse.json({ edits });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
