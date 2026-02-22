import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/db";
import { getEditsFromContent } from "@/lib/ai";
import { applyEdits } from "@/lib/apply-edits";

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
    const enhancedContent = applyEdits(content, edits);
    const nextVersion = doc.currentVersion + 1;
    const now = new Date();

    await collections.revisions().insertOne({
      documentId: id,
      version: nextVersion,
      content: enhancedContent,
      edits,
      createdAt: now,
    });

    await collections.documents().updateOne(
      { _id: new ObjectId(id) },
      { $set: { content: enhancedContent, currentVersion: nextVersion, updatedAt: now } }
    );

    return NextResponse.json({
      version: nextVersion,
      content: enhancedContent,
      edits,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
