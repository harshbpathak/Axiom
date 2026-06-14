"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, TrendingUp, SlidersHorizontal, History, Terminal } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/forecast", label: "Forecast", icon: TrendingUp },
  { href: "/pricing", label: "Pricing Lab", icon: SlidersHorizontal },
  { href: "/runs", label: "Past Runs", icon: History },
  { href: "/agents", label: "Agent Console", icon: Terminal },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[var(--border)] bg-[var(--panel)]">
      <div className="flex h-16 items-center px-6 border-b border-[var(--border)]">
        <h1 className="font-mono text-xl font-bold tracking-widest text-[var(--text-primary)]">
          AXIOM
        </h1>
      </div>
      <nav className="flex-1 space-y-1 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                isActive
                  ? "border-l-2 border-[var(--accent)] bg-slate-800/50 text-[var(--text-primary)]"
                  : "border-l-2 border-transparent text-[var(--text-secondary)] hover:bg-slate-800/30 hover:text-[var(--text-primary)]"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-[var(--accent)]" : "text-slate-500"}`} />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-6 border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
        <p>Axiom Engine v1.0.0</p>
      </div>
    </aside>
  );
}
