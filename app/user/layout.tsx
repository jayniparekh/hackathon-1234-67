"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Gear,
  Layout,
  Megaphone,
  FileText,
  MagicWand,
  ChartLineUp,
  Microphone,
  SignOut,
  PencilLine,
} from "@phosphor-icons/react";
import { useCurrentUser } from "@/hooks/use-current-user";

const navConfig = [
  { href: "/user/dashboard", label: "Dashboard", Icon: Layout },
  { href: "/user/content", label: "Content", Icon: FileText },
  { href: "/user/enhance-edits", label: "Enhance", Icon: MagicWand },
  { href: "/user/distribute", label: "Distribute", Icon: Megaphone },
  { href: "/user/templates", label: "Templates", Icon: FileText },
  { href: "/user/analytics", label: "Analytics", Icon: ChartLineUp },
  { href: "/user/brand-voice", label: "Brand Voice", Icon: Microphone },
  { href: "/user/live-editor", label: "Live Editor", Icon: PencilLine },
  { href: "/user/settings", label: "Settings", Icon: Gear },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useCurrentUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

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
            const Icon = item.Icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-[var(--radius-base)] border-2 px-3 py-2 text-sm font-semibold shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${isActive
                    ? "border-border bg-main text-main-foreground"
                    : "border-border bg-background text-foreground"
                  }`}
              >
                <Icon size={18} weight="duotone" />
                {item.label}
              </Link>
            );
          })}

          {/* User Info Section */}
          <div className="mt-auto border-t-2 border-border pt-4">
            {user ? (
              <div className="space-y-3">
                <div className="rounded-[var(--radius-base)] border-2 border-border bg-background p-3">
                  <p className="text-xs font-semibold text-foreground/70">Name</p>
                  <p className="truncate text-sm font-bold text-foreground">
                    {user.name}
                  </p>
                  <p className="text-xs font-semibold text-foreground/70 mt-2">
                    Email
                  </p>
                  <p className="truncate text-xs text-foreground">
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-base)] border-2 border-border bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-600 shadow-[var(--shadow)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 dark:text-red-400"
                >
                  <SignOut size={18} weight="duotone" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            ) : (
              <div className="animate-pulse rounded-[var(--radius-base)] border-2 border-border bg-background p-3 h-24" />
            )}
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}
