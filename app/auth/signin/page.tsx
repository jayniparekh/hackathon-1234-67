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
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-orange-50/20">
      <header className="border-b border-purple-100/50 bg-white/80 backdrop-blur-sm px-6 py-4">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link href="/" className="font-[family-name:var(--font-syne)] text-xl font-bold tracking-tight text-slate-900 hover:text-purple-700 transition-colors">
            Cortex
          </Link>
          <span className="text-sm text-slate-600">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="font-semibold text-orange-500 hover:text-orange-600 transition-colors">
              Sign up
            </Link>
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-md px-6 py-12">
        <Card className="border border-purple-200/50 bg-white/90 backdrop-blur-sm p-8 shadow-lg shadow-purple-200/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h1 className="font-[family-name:var(--font-syne)] mb-2 text-2xl font-bold text-slate-900">
                Sign In
              </h1>
              <p className="text-slate-600">
                Welcome back to Cortex
              </p>
            </div>

            {error && (
              <div className="flex gap-3 rounded border border-red-200 bg-red-50 p-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-slate-700 font-semibold">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded border border-purple-200/50 bg-purple-50/30 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-700 font-semibold">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded border border-purple-200/50 bg-purple-50/30 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center">
              <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Back to home
              </Link>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}

