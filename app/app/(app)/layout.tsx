"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sidebar } from "@/components/axiom/Sidebar";
import { TopBar } from "@/components/axiom/TopBar";

const TITLES: Record<string, string> = {
  "/dashboard": "Mission Control",
  "/forecast": "Runway Forecast",
  "/pricing": "Pricing & Sensitivity Lab",
  "/runs": "Past Runs",
  "/agents": "Agent Console",
};


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "Axiom";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-primary)]">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 z-50">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title={title} onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}


