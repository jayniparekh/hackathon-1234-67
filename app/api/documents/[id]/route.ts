import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await collections.documents().findOne({ _id: new ObjectId(id) });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const latest = await collections
      .revisions()
      .findOne({ documentId: id }, { sort: { version: -1 } });
    return NextResponse.json({
      id: String(doc._id),
      content: doc.content,
      currentVersion: doc.currentVersion,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      latestRevision: latest
        ? {
            version: latest.version,
            content: latest.content,
            edits: latest.edits,
            createdAt: latest.createdAt,
          }
        : null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { content?: string };
    const content = typeof body.content === "string" ? body.content : undefined;
    if (content === undefined) return NextResponse.json({ error: "content required" }, { status: 400 });
    const now = new Date();
    const res = await collections.documents().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { content, updatedAt: now } },
      { returnDocument: "after" }
    );
    if (!res) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      id: String(res._id),
      content: res.content,
      currentVersion: res.currentVersion,
      updatedAt: res.updatedAt,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
