"use client";

import { ThemeProvider } from "@/lib/theme";
import { Sidebar } from "@/components/sidebar";
import { usePathname } from "next/navigation";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <ThemeProvider>
      {isLanding ? (
        children
      ) : (
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      )}
    </ThemeProvider>
  );
}
