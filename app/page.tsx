"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Component as LiquidGradient } from "@/components/ui/flow-gradient-hero-section";

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative">
      <LiquidGradient 
        title="From Idea to Impact"
        showPauseButton={true}
        ctaText="Get Started"
        onCtaClick={() => router.push('/auth/signup')}
      />
      
      {/* Header overlay */}
      <header className="absolute top-0 z-50 w-full border-b border-white/20 bg-black/20 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-[family-name:var(--font-syne)] text-xl font-bold tracking-tight text-white">
            ContentForge AI
          </span>
          <nav className="flex gap-4">
            <Link
              href="/auth/signin"
              className="rounded-[var(--radius-base)] border-2 border-white/30 bg-white/10 px-4 py-2 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white/50"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-[var(--radius-base)] border-2 border-white/30 bg-white/10 px-4 py-2 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white/50"
            >
              Sign up
            </Link>
            <Link
              href="/user/dashboard"
              className="rounded-[var(--radius-base)] border-2 border-white/30 bg-white/10 px-4 py-2 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white/50"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
    </div>
  );
}
