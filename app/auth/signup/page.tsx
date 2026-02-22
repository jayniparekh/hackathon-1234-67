"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"basic" | "profile" | "creator" | "audience">("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Basic info
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Profile info
    gender: "",
    age: "",
    location: "",
    height: "",
    education: "",
    // Creator info
    niche: "",
    platforms: [] as string[],
    experienceLevel: "",
    contentTypes: [] as string[],
    contentGoal: "",
    postingFrequency: "",
    // Audience & Preferences
    audienceGen: "",
    audiencePlatforms: "" as string,
    contentLengthPreference: "",
    emojiUsage: "",
    hashtagPreference: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, value: string) => {
    setFormData((prev) => {
      const currentArray = prev[name as keyof typeof prev] as string[];
      if (currentArray.includes(value)) {
        return { ...prev, [name]: currentArray.filter((item) => item !== value) };
      } else {
        return { ...prev, [name]: [...currentArray, value] };
      }
    });
  };

  const validateBasic = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Invalid email address");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError(null);
    if (validateBasic()) {
      setStep("profile");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        username: formData.username || undefined,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        gender: formData.gender || undefined,
        age: formData.age ? parseInt(formData.age, 10) : undefined,
        location: formData.location || undefined,
        height: formData.height || undefined,
        education: formData.education || undefined,
        niche: formData.niche || undefined,
        platforms: formData.platforms.length > 0 ? formData.platforms : undefined,
        experienceLevel: formData.experienceLevel || undefined,
        contentTypes: formData.contentTypes.length > 0 ? formData.contentTypes : undefined,
        contentGoal: formData.contentGoal || undefined,
        postingFrequency: formData.postingFrequency || undefined,
        audienceGen: formData.audienceGen || undefined,
        audiencePlatforms: formData.audiencePlatforms || undefined,
        contentLengthPreference: formData.contentLengthPreference || undefined,
        emojiUsage: formData.emojiUsage || undefined,
        hashtagPreference: formData.hashtagPreference || undefined,
      };

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed. Please try again.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-orange-50/20">
      <header className="border-b border-purple-100/50 bg-white/80 backdrop-blur-sm px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/" className="font-[family-name:var(--font-syne)] text-xl font-bold tracking-tight text-slate-900 hover:text-purple-700 transition-colors">
            Cortex
          </Link>
          <span className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-semibold text-orange-500 hover:text-orange-600 transition-colors">
              Sign in
            </Link>
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        <Card className="border border-purple-200/50 bg-white/90 backdrop-blur-sm p-8 shadow-lg shadow-purple-200/10">
          {success ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <CheckCircle className="h-12 w-12 text-emerald-500" />
              <h2 className="text-2xl font-bold text-slate-900">Account Created!</h2>
              <p className="text-slate-600">Your account has been successfully created. Redirecting to sign in...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h1 className="font-[family-name:var(--font-syne)] mb-2 text-2xl font-bold text-slate-900">
                  {step === "basic" && "Create Your Account"}
                  {step === "profile" && "Personal Information"}
                  {step === "creator" && "Creator Profile"}
                  {step === "audience" && "Audience & Preferences"}
                </h1>
                <p className="text-slate-600">
                  {step === "basic" && "Enter your basic information"}
                  {step === "profile" && "Tell us about yourself"}
                  {step === "creator" && "Share your creator details"}
                  {step === "audience" && "Define your audience preferences"}
                </p>
              </div>

              {error && (
                <div className="flex gap-3 rounded border border-red-200 bg-red-50 p-4">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* BASIC INFO STEP */}
              {step === "basic" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-slate-700 font-semibold">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded border border-purple-200/50 bg-purple-50/30 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                    />
                  </div>

                  <div>
                    <Label htmlFor="username" className="text-slate-700 font-semibold">
                      Username (optional)
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded border border-purple-200/50 bg-purple-50/30 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-slate-700 font-semibold">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded border border-purple-200/50 bg-purple-50/30 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-slate-700 font-semibold">
                      Password *
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="At least 8 characters"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded border border-purple-200/50 bg-purple-50/30 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold">
                      Confirm Password *
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded border border-purple-200/50 bg-purple-50/30 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Link href="/auth/signin" className="flex-1">
                      <Button type="button" variant="outline" className="w-full">
                        Back
                      </Button>
                    </Link>
                    <Button type="button" onClick={handleNextStep} className="flex-1 bg-main text-main-foreground">
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* PROFILE INFO STEP */}
              {step === "profile" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gender" className="text-slate-700 font-semibold">
                        Gender
                      </Label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="mt-2 w-full rounded border border-purple-200/50 bg-purple-50/30 px-3 py-2 text-slate-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                      >
                        <option value="">Select...</option>
                        <option value="man">Man</option>
                        <option value="woman">Woman</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="age" className="text-slate-700 font-semibold">
                        Age
                      </Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        placeholder="25"
                        value={formData.age}
                        onChange={handleInputChange}
                        min="13"
                        max="150"
                        className="mt-2 w-full rounded border border-purple-200/50 bg-purple-50/30 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-slate-700 font-semibold">
                      Location
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="New York, USA"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded border border-purple-200/50 bg-purple-50/30 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                    />
                  </div>

                  <div>
                    <Label htmlFor="height" className="text-slate-700 font-semibold">
                      Height
                    </Label>
                    <Input
                      id="height"
                      name="height"
                      type="text"
                      placeholder="5'10"
                      value={formData.height}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded border border-purple-200/50 bg-purple-50/30 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                    />
                  </div>

                  <div>
                    <Label htmlFor="education" className="text-slate-700 font-semibold">
                      Education
                    </Label>
                    <select
                      id="education"
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded border border-purple-200/50 bg-purple-50/30 px-3 py-2 text-slate-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                    >
                      <option value="">Select...</option>
                      <option value="high-school">High School</option>
                      <option value="some-college">Some College</option>
                      <option value="bachelors">Bachelor's</option>
                      <option value="masters">Master's</option>
                      <option value="doctorate">Doctorate</option>
                      <option value="trade-school">Trade School</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("basic")}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setStep("creator")}
                      className="flex-1 bg-main text-main-foreground"
                    >
                      Next
                    </Button>
                  </div>

                  <p className="text-center text-sm text-slate-600">
                    All fields are optional. You can update them later.
                  </p>
                </div>
              )}

              {/* CREATOR PROFILE STEP */}
              {step === "creator" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="niche" className="text-slate-700 font-semibold">
                      Niche
                    </Label>
                    <select
                      id="niche"
                      name="niche"
                      value={formData.niche}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded border border-purple-200/50 bg-purple-50/30 px-3 py-2 text-slate-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                    >
                      <option value="">Select...</option>
                      <option value="fitness">Fitness</option>
                      <option value="beauty">Beauty</option>
                      <option value="lifestyle">Lifestyle</option>
                      <option value="tech">Tech</option>
                      <option value="business">Business</option>
                      <option value="finance">Finance</option>
                      <option value="education">Education</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-slate-700 font-semibold">Platforms</Label>
                    <div className="mt-2 space-y-2">
                      {["Instagram", "LinkedIn", "YouTube", "Twitter/X", "TikTok", "Blog", "Podcast", "Email"].map(
                        (platform) => (
                          <div key={platform} className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id={`platform-${platform}`}
                              checked={formData.platforms.includes(platform)}
                              onChange={() => handleCheckboxChange("platforms", platform)}
                              className="h-4 w-4 rounded border border-purple-200/50 accent-orange-400"
                            />
                            <Label htmlFor={`platform-${platform}`} className="cursor-pointer text-slate-700">
                              {platform}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="experienceLevel" className="text-slate-700 font-semibold">
                      Experience Level
                    </Label>
                    <select
                      id="experienceLevel"
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded border border-purple-200/50 bg-purple-50/30 px-3 py-2 text-slate-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                    >
                      <option value="">Select...</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-slate-700 font-semibold">Content Types</Label>
                    <div className="mt-2 space-y-2">
                      {[
                        "Short-form video",
                        "Long-form video",
                        "Articles",
                        "Threads",
                        "Newsletters",
                        "Podcasts",
                        "Carousels",
                      ].map((type) => (
                        <div key={type} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id={`content-type-${type}`}
                            checked={formData.contentTypes.includes(type)}
                            onChange={() => handleCheckboxChange("contentTypes", type)}
                            className="h-4 w-4 rounded border border-purple-200/50 accent-orange-400"
                          />
                          <Label htmlFor={`content-type-${type}`} className="cursor-pointer text-slate-700">
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contentGoal" className="text-slate-700 font-semibold">
                      Content Goal
                    </Label>
                    <select
                      id="contentGoal"
                      name="contentGoal"
                      value={formData.contentGoal}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded border border-purple-200/50 bg-purple-50/30 px-3 py-2 text-slate-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                    >
                      <option value="">Select...</option>
                      <option value="Build Audience">Build Audience</option>
                      <option value="Sell Product">Sell Product</option>
                      <option value="Educate">Educate</option>
                      <option value="Personal Brand">Personal Brand</option>
                      <option value="Drive Traffic">Drive Traffic</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="postingFrequency" className="text-slate-700 font-semibold">
                      Posting Frequency (per week)
                    </Label>
                    <select
                      id="postingFrequency"
                      name="postingFrequency"
                      value={formData.postingFrequency}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded border border-purple-200/50 bg-purple-50/30 px-3 py-2 text-slate-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                    >
                      <option value="">Select...</option>
                      <option value="1-2">1–2 posts</option>
                      <option value="3-5">3–5 posts</option>
                      <option value="daily">Daily</option>
                      <option value="multiple">Multiple per day</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("profile")}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setStep("audience")}
                      className="flex-1 bg-main text-main-foreground"
                    >
                      Next
                    </Button>
                  </div>

                  <p className="text-center text-sm text-slate-600">
                    All fields are optional. You can update them later.
                  </p>
                </div>
              )}

              {/* AUDIENCE & PREFERENCES STEP */}
              {step === "audience" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="audienceGen" className="text-slate-700 font-semibold">
                      Target Audience Generation
                    </Label>
                    <select
                      id="audienceGen"
                      name="audienceGen"
                      value={formData.audienceGen}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded border border-purple-200/50 bg-purple-50/30 px-3 py-2 text-slate-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                    >
                      <option value="">Select...</option>
                      <option value="Gen Z">Gen Z</option>
                      <option value="Millennials">Millennials</option>
                      <option value="Gen X">Gen X</option>
                      <option value="Boomers">Boomers</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="audiencePlatforms" className="text-slate-700 font-semibold">
                      Audience Platforms (comma-separated)
                    </Label>
                    <Input
                      id="audiencePlatforms"
                      name="audiencePlatforms"
                      type="text"
                      placeholder="e.g., Instagram, YouTube, LinkedIn"
                      value={formData.audiencePlatforms}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded border border-purple-200/50 bg-purple-50/30 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contentLengthPreference" className="text-slate-700 font-semibold">
                      Content Length Preference
                    </Label>
                    <select
                      id="contentLengthPreference"
                      name="contentLengthPreference"
                      value={formData.contentLengthPreference}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded border border-purple-200/50 bg-purple-50/30 px-3 py-2 text-slate-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                    >
                      <option value="">Select...</option>
                      <option value="Short">Short</option>
                      <option value="Medium">Medium</option>
                      <option value="Long">Long</option>
                      <option value="Platform-specific">Platform-specific</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="emojiUsage" className="text-slate-700 font-semibold">
                      Emoji Usage
                    </Label>
                    <select
                      id="emojiUsage"
                      name="emojiUsage"
                      value={formData.emojiUsage}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded border border-purple-200/50 bg-purple-50/30 px-3 py-2 text-slate-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                    >
                      <option value="">Select...</option>
                      <option value="None">None</option>
                      <option value="Minimal">Minimal</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Heavy">Heavy</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="hashtagPreference" className="text-slate-700 font-semibold">
                      Hashtag Preference
                    </Label>
                    <select
                      id="hashtagPreference"
                      name="hashtagPreference"
                      value={formData.hashtagPreference}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded border border-purple-200/50 bg-purple-50/30 px-3 py-2 text-slate-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                    >
                      <option value="">Select...</option>
                      <option value="None">None</option>
                      <option value="Few">Few</option>
                      <option value="Many">Many</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("creator")}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-main text-main-foreground"
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </div>

                  <p className="text-center text-sm text-slate-600">
                    All fields are optional. You can update them later.
                  </p>
                </div>
              )}
            </form>
          )}
        </Card>
      </main>
    </div>
  );
}
