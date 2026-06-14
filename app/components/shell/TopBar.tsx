"use client";

import { usePathname } from "next/navigation";
import StatusBadge from "./StatusBadge";

const routeNames: Record<string, string> = {
  "/dashboard": "Mission Control",
  "/forecast": "Runway Forecast",
  "/pricing": "Pricing Lab",
  "/runs": "Past Runs",
  "/agents": "Agent Console",
};

export default function TopBar() {
  const pathname = usePathname();
  const title = routeNames[pathname || ""] || "Axiom";

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-primary)] px-6 lg:px-8">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
      <StatusBadge />
    </header>
  );
}
