import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-secondary-background px-6 py-4 shadow-[var(--shadow)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-[family-name:var(--font-syne)] text-xl font-bold tracking-tight text-foreground">
            ContentForge AI
          </span>
          <nav className="flex gap-4">
            <Link
              href="/auth/signin"
              className="rounded-[var(--radius-base)] border-2 border-border bg-main px-4 py-2 font-semibold text-main-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Sign in
            </Link>
            <Link
              href="/user/dashboard"
              className="rounded-[var(--radius-base)] border-2 border-border bg-background px-4 py-2 font-semibold text-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-24">
        <section className="relative overflow-hidden rounded-[var(--radius-base)] border-2 border-border bg-secondary-background p-12 shadow-[var(--shadow)] md:p-16">
          <div className="relative z-10 max-w-2xl">
            <h1 className="font-[family-name:var(--font-syne)] mb-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
              From Idea to Impact
            </h1>
            <p className="mb-10 text-lg text-foreground/90">
              Intelligent content creation and distribution at scale. Generate
              text, audio, and video. Keep your narrative consistent. Publish
              everywhere in one click.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/user/dashboard"
                className="inline-block rounded-[var(--radius-base)] border-2 border-border bg-main px-6 py-3 font-semibold text-main-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                Get started
              </Link>
              <Link
                href="/auth/signin"
                className="inline-block rounded-[var(--radius-base)] border-2 border-border bg-background px-6 py-3 font-semibold text-foreground shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                Sign in
              </Link>
            </div>
          </div>
          <div
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-2 border-border bg-main opacity-90 shadow-[var(--shadow)]"
            aria-hidden
          />
        </section>
      </main>
    </div>
  );
}
