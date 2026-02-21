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
  const [step, setStep] = useState<"basic" | "profile">("basic");
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
    niche: "",
    height: "",
    education: "",
    occupation: "",
    religion: "",
    drinkingHabits: "",
    smokingHabits: "",
    fitnessLevel: "",
    dietaryPreferences: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        niche: formData.niche || undefined,
        height: formData.height || undefined,
        education: formData.education || undefined,
        occupation: formData.occupation || undefined,
        religion: formData.religion || undefined,
        drinkingHabits: formData.drinkingHabits || undefined,
        smokingHabits: formData.smokingHabits || undefined,
        fitnessLevel: formData.fitnessLevel || undefined,
        dietaryPreferences: formData.dietaryPreferences || undefined,
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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-secondary-background px-6 py-4 shadow-[var(--shadow)]">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/" className="font-[family-name:var(--font-syne)] text-xl font-bold tracking-tight text-foreground">
            ContentForge AI
          </Link>
          <span className="text-sm text-foreground/70">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-semibold text-main hover:underline">
              Sign in
            </Link>
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        <Card className="border-2 border-border bg-secondary-background p-8 shadow-[var(--shadow)]">
          {success ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <h2 className="text-2xl font-bold text-foreground">Account Created!</h2>
              <p className="text-foreground/80">Your account has been successfully created. Redirecting to sign in...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h1 className="font-[family-name:var(--font-syne)] mb-2 text-2xl font-bold text-foreground">
                  Create Your Account
                </h1>
                <p className="text-foreground/80">
                  {step === "basic" ? "Enter your basic information" : "Tell us about yourself"}
                </p>
              </div>

              {error && (
                <div className="flex gap-3 rounded-[var(--radius-base)] border-2 border-red-500 bg-red-100 p-4 dark:bg-red-900/20">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {/* BASIC INFO STEP */}
              {step === "basic" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-foreground">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="username" className="text-foreground">
                      Username (optional)
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-foreground">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-foreground">
                      Password *
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="At least 8 characters"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-foreground">
                      Confirm Password *
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Link href="/auth/signin" className="flex-1">
                      <Button type="button" variant="outline" className="w-full">
                        Back
                      </Button>
                    </Link>
                    <Button type="button" onClick={handleNextStep} className="flex-1 bg-main text-main-foreground">
                      Next: Profile Info
                    </Button>
                  </div>
                </div>
              )}

              {/* PROFILE INFO STEP */}
              {step === "profile" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gender" className="text-foreground">
                        Gender
                      </Label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="mt-2 w-full rounded border-2 border-border bg-background px-3 py-2 text-foreground"
                      >
                        <option value="">Select...</option>
                        <option value="man">Man</option>
                        <option value="woman">Woman</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="age" className="text-foreground">
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
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-foreground">
                      Location
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="New York, USA"
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="niche" className="text-foreground">
                        Niche
                      </Label>
                      <select
                        id="niche"
                        name="niche"
                        value={formData.niche}
                        onChange={handleInputChange}
                        className="mt-2 w-full rounded border-2 border-border bg-background px-3 py-2 text-foreground"
                      >
                        <option value="">Select...</option>
                        <option value="fitness">Fitness</option>
                        <option value="beauty">Beauty</option>
                        <option value="lifestyle">Lifestyle</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="height" className="text-foreground">
                        Height
                      </Label>
                      <Input
                        id="height"
                        name="height"
                        type="text"
                        placeholder="5&apos;10&quot;"
                        value={formData.height}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="education" className="text-foreground">
                        Education
                      </Label>
                      <select
                        id="education"
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                        className="mt-2 w-full rounded border-2 border-border bg-background px-3 py-2 text-foreground"
                      >
                        <option value="">Select...</option>
                        <option value="high-school">High School</option>
                        <option value="some-college">Some College</option>
                        <option value="bachelors">Bachelor&apos;s</option>
                        <option value="masters">Master&apos;s</option>
                        <option value="doctorate">Doctorate</option>
                        <option value="trade-school">Trade School</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="occupation" className="text-foreground">
                        Occupation
                      </Label>
                      <Input
                        id="occupation"
                        name="occupation"
                        type="text"
                        placeholder="Software Engineer"
                        value={formData.occupation}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="religion" className="text-foreground">
                        Religion
                      </Label>
                      <select
                        id="religion"
                        name="religion"
                        value={formData.religion}
                        onChange={handleInputChange}
                        className="mt-2 w-full rounded border-2 border-border bg-background px-3 py-2 text-foreground"
                      >
                        <option value="">Select...</option>
                        <option value="agnostic">Agnostic</option>
                        <option value="atheist">Atheist</option>
                        <option value="buddhist">Buddhist</option>
                        <option value="christian">Christian</option>
                        <option value="hindu">Hindu</option>
                        <option value="jewish">Jewish</option>
                        <option value="muslim">Muslim</option>
                        <option value="spiritual">Spiritual</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="drinkingHabits" className="text-foreground">
                        Drinking Habits
                      </Label>
                      <select
                        id="drinkingHabits"
                        name="drinkingHabits"
                        value={formData.drinkingHabits}
                        onChange={handleInputChange}
                        className="mt-2 w-full rounded border-2 border-border bg-background px-3 py-2 text-foreground"
                      >
                        <option value="">Select...</option>
                        <option value="never">Never</option>
                        <option value="rarely">Rarely</option>
                        <option value="socially">Socially</option>
                        <option value="regularly">Regularly</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smokingHabits" className="text-foreground">
                        Smoking Habits
                      </Label>
                      <select
                        id="smokingHabits"
                        name="smokingHabits"
                        value={formData.smokingHabits}
                        onChange={handleInputChange}
                        className="mt-2 w-full rounded border-2 border-border bg-background px-3 py-2 text-foreground"
                      >
                        <option value="">Select...</option>
                        <option value="never">Never</option>
                        <option value="socially">Socially</option>
                        <option value="regularly">Regularly</option>
                        <option value="trying-to-quit">Trying to Quit</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="fitnessLevel" className="text-foreground">
                        Fitness Level
                      </Label>
                      <select
                        id="fitnessLevel"
                        name="fitnessLevel"
                        value={formData.fitnessLevel}
                        onChange={handleInputChange}
                        className="mt-2 w-full rounded border-2 border-border bg-background px-3 py-2 text-foreground"
                      >
                        <option value="">Select...</option>
                        <option value="not-active">Not Active</option>
                        <option value="occasionally">Occasionally</option>
                        <option value="moderately">Moderately</option>
                        <option value="very">Very</option>
                        <option value="athlete">Athlete</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dietaryPreferences" className="text-foreground">
                      Dietary Preferences
                    </Label>
                    <select
                      id="dietaryPreferences"
                      name="dietaryPreferences"
                      value={formData.dietaryPreferences}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded border-2 border-border bg-background px-3 py-2 text-foreground"
                    >
                      <option value="">Select...</option>
                      <option value="no-restrictions">No Restrictions</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="pescatarian">Pescatarian</option>
                      <option value="kosher">Kosher</option>
                      <option value="halal">Halal</option>
                      <option value="other">Other</option>
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
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-main text-main-foreground"
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </div>

                  <p className="text-center text-sm text-foreground/70">
                    All profile fields are optional. You can update them later.
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
