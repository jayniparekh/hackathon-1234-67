import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { version?: number };
    const version = Number(body.version);
    if (!Number.isInteger(version) || version < 0) {
      return NextResponse.json({ error: "version must be a non-negative integer" }, { status: 400 });
    }

    const rev = await collections.revisions().findOne({ documentId: id, version });
    if (!rev) return NextResponse.json({ error: "Revision not found" }, { status: 404 });

    const now = new Date();
    await collections.documents().updateOne(
      { _id: new ObjectId(id) },
      { $set: { content: rev.content, currentVersion: version, updatedAt: now } }
    );

    return NextResponse.json({
      version,
      content: rev.content,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
