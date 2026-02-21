"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navConfig = [
  { href: "/user/dashboard", label: "Dashboard" },
  { href: "/user/content", label: "Content" },
  { href: "/user/enhance", label: "Enhance" },
  { href: "/user/distribute", label: "Distribute" },
  { href: "/user/templates", label: "Templates" },
  { href: "/user/analytics", label: "Analytics" },
  { href: "/user/settings", label: "Settings" },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-56 shrink-0 border-r-2 border-border bg-secondary-background shadow-[var(--shadow)]">
        <div className="sticky top-0 flex flex-col gap-1 p-4">
          <Link
            href="/"
            className="mb-4 font-[family-name:var(--font-syne)] text-lg font-bold text-foreground"
          >
            ContentForge AI
          </Link>
          {navConfig.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-[var(--radius-base)] border-2 px-3 py-2 text-sm font-semibold shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${
                  isActive
                    ? "border-border bg-main text-main-foreground"
                    : "border-border bg-background text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}
