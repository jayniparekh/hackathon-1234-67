export default function ContentPage() {
  return (
    <>
      <div className="border-b-2 border-border bg-secondary-background px-8 py-6 shadow-[var(--shadow)]">
      <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
        Content
      </h1>
      <p className="mt-2 text-foreground/80">
        Intelligent content creation hub. Multi-modal input, templates, and
        fine-tuned generation.
      </p>
    </div>
    <div className="p-8">
      <p className="text-foreground/70">
        Mock: Create text, audio, and video from ideas. Paste URLs, upload
        files, or type a brief. The AI will draft and refine for you.
      </p>
    </div>
    </>
  );
}
