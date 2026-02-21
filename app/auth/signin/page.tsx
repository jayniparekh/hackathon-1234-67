"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Sign in failed. Please try again.");
        return;
      }

      // Redirect to dashboard on success
      router.push("/user/dashboard");
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
            Don't have an account?{" "}
            <Link href="/auth/signup" className="font-semibold text-main hover:underline">
              Sign up
            </Link>
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-md px-6 py-12">
        <Card className="border-2 border-border bg-secondary-background p-8 shadow-[var(--shadow)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h1 className="font-[family-name:var(--font-syne)] mb-2 text-2xl font-bold text-foreground">
                Sign In
              </h1>
              <p className="text-foreground/80">
                Welcome back to ContentForge AI
              </p>
            </div>

            {error && (
              <div className="flex gap-3 rounded-[var(--radius-base)] border-2 border-red-500 bg-red-100 p-4 dark:bg-red-900/20">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-main text-main-foreground"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center">
              <Link href="/" className="text-sm text-foreground/70 hover:text-foreground">
                Back to home
              </Link>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}

