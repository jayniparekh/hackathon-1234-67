import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { collections } from "@/lib/db";
import { generateContentCalendar, type ContentCalendarInput } from "@/lib/gemini";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    let user;
    try {
      user = await collections.users().findOne({ _id: new ObjectId(payload.userId) });
    } catch {
      user = null;
    }
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const input: ContentCalendarInput = {
      niche: user.niche,
      platforms: user.platforms,
      postingFrequency: user.postingFrequency,
      contentLengthPreference: user.contentLengthPreference,
      audienceGen: user.audienceGen,
      audiencePlatforms: user.audiencePlatforms,
      contentTypes: user.contentTypes,
      contentGoal: user.contentGoal,
      experienceLevel: user.experienceLevel,
    };
    const calendar = await generateContentCalendar(input);
    return NextResponse.json({ calendar });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to generate calendar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
