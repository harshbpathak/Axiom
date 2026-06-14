"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export default function EmptyState({ message = "Run an analysis to see your data" }: { message?: string }) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 rounded-full bg-slate-800/50 p-6">
        <LayoutDashboard className="h-12 w-12 text-slate-500" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">No active data</h3>
      <p className="mb-8 max-w-md text-[var(--text-secondary)]">{message}</p>
      <Link
        href="/dashboard"
        className="rounded-lg bg-teal-600 px-6 py-3 font-medium text-white transition hover:bg-teal-500"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
