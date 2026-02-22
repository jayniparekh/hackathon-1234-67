import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { collections } from "@/lib/db";
import { generateContentFromBrief } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload?.userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    let user = null;
    try {
      user = await collections.users().findOne({ _id: new ObjectId(payload.userId) });
    } catch {
      //
    }
    const body = await request.json();
    const input = typeof body?.input === "string" ? body.input.trim() : "";
    const contentType = typeof body?.contentType === "string" ? body.contentType : "blog";
    const outputFormat = typeof body?.outputFormat === "string" ? body.outputFormat : "text";
    if (!input) return NextResponse.json({ error: "input is required" }, { status: 400 });
    const ctx = user
      ? {
          niche: user.niche,
          platforms: user.platforms,
          audienceGen: user.audienceGen,
          audiencePlatforms: user.audiencePlatforms,
          contentLengthPreference: user.contentLengthPreference,
          contentTypes: user.contentTypes,
          contentGoal: user.contentGoal,
        }
      : {};
    const content = await generateContentFromBrief(input, contentType, outputFormat, ctx);
    return NextResponse.json({ content });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
