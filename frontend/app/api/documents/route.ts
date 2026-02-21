import { NextResponse } from "next/server";
import { collections } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { content?: string };
    const content = typeof body.content === "string" ? body.content : "";
    const now = new Date();
    const res = await collections.documents().insertOne({
      content,
      currentVersion: 0,
      createdAt: now,
      updatedAt: now,
    });
    const id = String(res.insertedId);
    await collections.revisions().insertOne({
      documentId: id,
      version: 0,
      content,
      edits: [],
      createdAt: now,
    });
    return NextResponse.json({ id, content, currentVersion: 0 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const list = await collections
      .documents()
      .find({})
      .sort({ updatedAt: -1 })
      .limit(50)
      .project({ content: 1, currentVersion: 1, updatedAt: 1 })
      .toArray();
    const docs = list.map((d) => ({
      id: d._id != null ? String(d._id) : "",
      content: d.content,
      currentVersion: d.currentVersion,
      updatedAt: d.updatedAt,
    }));
    return NextResponse.json({ documents: docs });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
