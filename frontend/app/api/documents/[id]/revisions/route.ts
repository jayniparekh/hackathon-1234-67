import { NextResponse } from "next/server";
import { collections } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const list = await collections
      .revisions()
      .find({ documentId: id })
      .sort({ version: -1 })
      .limit(100)
      .toArray();
    const revisions = list.map((r) => ({
      version: r.version,
      content: r.content,
      editsCount: r.edits?.length ?? 0,
      createdAt: r.createdAt,
    }));
    return NextResponse.json({ revisions });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
