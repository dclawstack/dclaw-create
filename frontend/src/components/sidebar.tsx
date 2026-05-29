"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Bot,
  Type,
  Image,
  Music,
  Video,
  Library,
  LayoutGrid,
  Palette,
  Cpu,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [generateOpen, setGenerateOpen] = useState(true);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  const navItemClass = (href: string) =>
    cn(
      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
      isActive(href)
        ? "bg-brand-pink/10 text-brand-pink font-medium"
        : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
    );

  return (
    <aside className="flex-shrink-0 w-56 bg-[var(--card)] border-r border-[var(--border)] flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4">
        <span className="text-brand-pink">✨</span>
        <span className="text-base font-bold text-[var(--foreground)]">DClaw Create</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        <Link href="/dashboard" className={navItemClass("/dashboard")}>
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          Dashboard
        </Link>

        <Link href="/copilot" className={navItemClass("/copilot")}>
          <Bot className="h-4 w-4 shrink-0" />
          AI Copilot
        </Link>

        {/* Generate section */}
        <div className="mt-3">
          <button
            onClick={() => setGenerateOpen((o) => !o)}
            className="w-full flex items-center justify-between px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            Generate
            {generateOpen ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>

          {generateOpen && (
            <div className="mt-0.5 space-y-0.5">
              <Link
                href="/generate/text"
                className={cn(navItemClass("/generate/text"), "pl-5")}
              >
                <Type className="h-4 w-4 shrink-0" />
                Text
              </Link>
              <Link
                href="/generate/image"
                className={cn(navItemClass("/generate/image"), "pl-5")}
              >
                <Image className="h-4 w-4 shrink-0" />
                Image
              </Link>
              <Link
                href="/generate/audio"
                className={cn(navItemClass("/generate/audio"), "pl-5")}
              >
                <Music className="h-4 w-4 shrink-0" />
                Audio
              </Link>
              <Link
                href="/generate/video"
                className={cn(navItemClass("/generate/video"), "pl-5")}
              >
                <Video className="h-4 w-4 shrink-0" />
                Video
              </Link>
            </div>
          )}
        </div>

        <Link href="/assets" className={cn(navItemClass("/assets"), "mt-1")}>
          <Library className="h-4 w-4 shrink-0" />
          Assets
        </Link>

        <Link href="/templates" className={navItemClass("/templates")}>
          <LayoutGrid className="h-4 w-4 shrink-0" />
          Templates
        </Link>

        <Link href="/brand-kit" className={navItemClass("/brand-kit")}>
          <Palette className="h-4 w-4 shrink-0" />
          Brand Kit
        </Link>

        {/* Settings section */}
        <div className="mt-3">
          <span className="block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Settings
          </span>
          <div className="mt-0.5 space-y-0.5">
            <Link
              href="/settings/ai-providers"
              className={cn(navItemClass("/settings/ai-providers"), "pl-5")}
            >
              <Cpu className="h-4 w-4 shrink-0" />
              AI Providers
            </Link>
          </div>
        </div>
      </nav>

      {/* Theme toggle */}
      <div className="mt-auto border-t border-[var(--border)] p-3">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          {theme === "dark" ? (
            <>
              <Sun className="h-4 w-4 shrink-0" />
              Light
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 shrink-0" />
              Dark
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
