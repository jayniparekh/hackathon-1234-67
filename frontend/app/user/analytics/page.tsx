export default function AnalyticsPage() {
  return (
    <>
      <div className="border-b-2 border-border bg-secondary-background px-8 py-6 shadow-[var(--shadow)]">
      <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
        Analytics
      </h1>
      <p className="mt-2 text-foreground/80">
        Performance heatmaps, best formats, optimal times. Learning loop
        feedback.
      </p>
    </div>
    <div className="p-8">
      <p className="text-foreground/70">
        Mock: See what works. Engagement predictions, sentiment scores, and
        ROI. Data feeds back into the models for better suggestions next time.
      </p>
    </div>
    </>
  );
}
