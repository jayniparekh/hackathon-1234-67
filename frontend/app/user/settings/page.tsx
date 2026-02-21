export default function SettingsPage() {
  return (
    <>
      <div className="border-b-2 border-border bg-secondary-background px-8 py-6 shadow-[var(--shadow)]">
      <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
        Settings
      </h1>
      <p className="mt-2 text-foreground/80">
        Account, brand voice, API keys, and integrations.
      </p>
    </div>
    <div className="p-8">
      <p className="text-foreground/70">
        Mock: Manage your profile, connect social accounts, upload brand
        guidelines, and configure fine-tuned models. Clerk auth will be wired
        here.
      </p>
    </div>
    </>
  );
}
