import { NextResponse } from "next/server";
import { collections } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { generateToken } from "@/lib/jwt";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  username: z.string().min(3, "Username must be at least 3 characters").trim().optional().or(z.literal("")),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  gender: z.enum(["man", "woman", "non-binary", "prefer-not-to-say"]).optional(),
  age: z.number().int().min(13).max(150).optional(),
  location: z.string().trim().optional(),
  niche: z.enum(["fitness", "beauty", "lifestyle"]).optional(),
  height: z.string().optional(),
  education: z.enum(["", "high-school", "some-college", "bachelors", "masters", "doctorate", "trade-school"]).optional(),
  occupation: z.string().trim().optional(),
  religion: z.enum(["", "agnostic", "atheist", "buddhist", "christian", "hindu", "jewish", "muslim", "spiritual", "other"]).optional(),
  drinkingHabits: z.enum(["", "never", "rarely", "socially", "regularly"]).optional(),
  smokingHabits: z.enum(["", "never", "socially", "regularly", "trying-to-quit"]).optional(),
  fitnessLevel: z.enum(["", "not-active", "occasionally", "moderately", "very", "athlete"]).optional(),
  dietaryPreferences: z.enum(["", "no-restrictions", "vegetarian", "vegan", "pescatarian", "kosher", "halal", "other"]).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 422 }
      );
    }

    const data = validationResult.data;
    const { password, confirmPassword, ...userData } = data;

    // Check if email already exists
    const existingUser = await collections.users().findOne({ email: data.email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Check if username exists (if provided)
    if (data.username) {
      const existingUsername = await collections.users().findOne({ username: data.username });
      if (existingUsername) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 409 }
        );
      }
    }

    // Hash password
    const passwordHash = hashPassword(password);
    const now = new Date();

    // Create user
    const result = await collections.users().insertOne({
      name: userData.name,
      email: userData.email,
      username: userData.username || undefined,
      passwordHash,
      gender: userData.gender,
      age: userData.age,
      location: userData.location,
      niche: userData.niche,
      height: userData.height,
      education: userData.education,
      occupation: userData.occupation,
      religion: userData.religion,
      drinkingHabits: userData.drinkingHabits,
      smokingHabits: userData.smokingHabits,
      fitnessLevel: userData.fitnessLevel,
      dietaryPreferences: userData.dietaryPreferences,
      createdAt: now,
      updatedAt: now,
    });

    const userId = String(result.insertedId);

    // Generate JWT token
    const token = generateToken({
      userId,
      email: userData.email,
      name: userData.name,
    });

    // Create response with token as httpOnly cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        userId,
        user: {
          id: userId,
          name: userData.name,
          email: userData.email,
          username: userData.username,
        },
      },
      { status: 201 }
    );

    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (e) {
    console.error("Signup error:", e);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
