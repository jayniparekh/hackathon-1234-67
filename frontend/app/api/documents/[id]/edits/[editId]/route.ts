import { NextResponse } from "next/server";
import { collections } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; editId: string }> }
) {
  try {
    const { id, editId } = await params;
    const body = (await request.json()) as { userAction?: "accepted" | "rejected" };
    const userAction = body.userAction ?? null;
    if (userAction !== "accepted" && userAction !== "rejected") {
      return NextResponse.json({ error: "userAction must be accepted or rejected" }, { status: 400 });
    }

    const rev = await collections.revisions().findOne(
      { documentId: id, "edits.editId": editId },
      { sort: { version: -1 } }
    );
    if (!rev || !rev.edits) return NextResponse.json({ error: "Edit not found" }, { status: 404 });

    const editIndex = rev.edits.findIndex((e) => e.editId === editId);
    if (editIndex === -1) return NextResponse.json({ error: "Edit not found" }, { status: 404 });

    const key = `edits.${editIndex}.userAction`;
    await collections.revisions().updateOne(
      { _id: rev._id },
      { $set: { [key]: userAction } }
    );

    return NextResponse.json({ editId, userAction });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
