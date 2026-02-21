export default function TemplatesPage() {
  return (
    <>
      <div className="border-b-2 border-border bg-secondary-background px-8 py-6 shadow-[var(--shadow)]">
      <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
        Templates
      </h1>
      <p className="mt-2 text-foreground/80">
        Blog posts, tweets, scripts, ad copy. Customize by brand voice.
      </p>
    </div>
    <div className="p-8">
      <p className="text-foreground/70">
        Mock: Choose from 50+ templates. Each adapts to your brand and output
        format. New templates added regularly.
      </p>
    </div>
    </>
  );
}
