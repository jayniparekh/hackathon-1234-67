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
  TrendUp,
  CalendarBlank,
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
  { href: "/user/strategy-hub", label: "Strategy Hub", Icon: TrendUp },
  { href: "/user/content-calendar", label: "Content Calendar", Icon: CalendarBlank },
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
    <div className="flex min-h-screen bg-white">
      <aside className="w-56 shrink-0 border-r border-purple-200/50 bg-white shadow-sm">
        <div className="sticky top-0 flex flex-col gap-1 p-4">
          <Link
            href="/"
            className="mb-4 font-[family-name:var(--font-syne)] text-lg font-bold text-slate-900 hover:text-purple-700 transition-colors"
          >
            Cortex
          </Link>
          {navConfig.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.Icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded px-3 py-2 text-sm font-semibold transition-colors ${isActive
                    ? "border border-orange-300 bg-orange-50 text-orange-700"
                    : "border border-purple-200/30 bg-purple-50/30 text-slate-700 hover:bg-purple-100/40"
                  }`}
              >
                <Icon size={18} weight="duotone" />
                {item.label}
              </Link>
            );
          })}

          {/* User Info Section */}
          <div className="mt-auto border-t border-purple-200/50 pt-4">
            {user ? (
              <div className="space-y-3">
                <div className="rounded border border-purple-200/50 bg-purple-50/30 p-3">
                  <p className="text-xs font-semibold text-slate-600">Name</p>
                  <p className="truncate text-sm font-bold text-slate-900">
                    {user.name}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 mt-2">
                    Email
                  </p>
                  <p className="truncate text-xs text-slate-700">
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center justify-center gap-2 rounded border border-red-200/50 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-100 disabled:opacity-50"
                >
                  <SignOut size={18} weight="duotone" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            ) : (
              <div className="animate-pulse rounded border border-purple-200/50 bg-purple-50/30 p-3 h-24" />
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
