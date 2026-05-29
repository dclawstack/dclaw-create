"use client";

import Link from "next/link";
import { useTheme } from "@/lib/theme";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-[var(--border)]/50 bg-[var(--background)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span>✨</span>
          <span>
            <span className="text-brand-pink">DClaw</span>
            <span className="text-[var(--foreground)]"> Create</span>
          </span>
        </Link>

        {/* Center nav links — hidden on mobile */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="#features"
            className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
          >
            Features
          </Link>
          <Link
            href="#demo"
            className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
          >
            Demo
          </Link>
          <Link
            href="/templates"
            className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
          >
            Templates
          </Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg bg-brand-pink px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Open App
          </Link>
        </div>
      </div>
    </nav>
  );
}
