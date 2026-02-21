export default function DashboardPage() {
  return (
    <>
      <div className="border-b-2 border-border bg-secondary-background px-8 py-6 shadow-[var(--shadow)]">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="mt-2 text-foreground/80">
          Overview of your content pipeline and recent activity. Quick stats and
          shortcuts will go here.
        </p>
      </div>
      <div className="p-8">
        <p className="text-foreground/70">
          Mock: Your dashboard home. Create, enhance, and distribute content from
          one place. Metrics and learning loop data will appear here.
        </p>
      </div>
    </>
  );
}
