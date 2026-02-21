import { NextResponse } from "next/server";
import { collections } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; version: string }> }
) {
  try {
    const { id, version: versionStr } = await params;
    const version = parseInt(versionStr, 10);
    if (!Number.isInteger(version) || version < 0) {
      return NextResponse.json({ error: "Invalid version" }, { status: 400 });
    }
    const rev = await collections.revisions().findOne({ documentId: id, version });
    if (!rev) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      version: rev.version,
      content: rev.content,
      edits: rev.edits ?? [],
      createdAt: rev.createdAt,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
