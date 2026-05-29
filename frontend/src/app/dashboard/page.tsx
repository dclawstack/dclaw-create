"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wand2,
  Grid,
  Bot,
  Palette,
  Image,
  FileText,
  Video,
  Mic,
  Layers,
  Package,
} from "lucide-react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardStats {
  asset_count: number;
  generation_count: number;
  template_count: number;
  active_brand_kit: string | null;
  recent_items: RecentItem[];
}

interface RecentItem {
  id: string;
  title: string;
  type: "asset" | "generation";
  created_at: string;
}

interface SeedStatus {
  assets: { seeded: number; user: number };
  collections: { seeded: number; user: number };
  templates: { seeded: number; user: number };
  brand_kits: { seeded: number; user: number };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function totalSeeded(status: SeedStatus): number {
  return (
    status.assets.seeded +
    status.collections.seeded +
    status.templates.seeded +
    status.brand_kits.seeded
  );
}

function RecentItemIcon({ type, title }: { type: string; title: string }) {
  if (type === "generation") return <Wand2 className="h-4 w-4" />;
  const t = title.toLowerCase();
  if (t.includes("video")) return <Video className="h-4 w-4" />;
  if (t.includes("audio") || t.includes("podcast") || t.includes("voice") || t.includes("jingle"))
    return <Mic className="h-4 w-4" />;
  if (t.includes("text") || t.includes("copy") || t.includes("caption") || t.includes("email") || t.includes("description"))
    return <FileText className="h-4 w-4" />;
  return <Image className="h-4 w-4" />;
}

// ---------------------------------------------------------------------------
// Skeleton helpers
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="mb-3 h-8 w-8 rounded-lg bg-[var(--muted)]" />
      <div className="mb-2 h-7 w-16 rounded bg-[var(--muted)]" />
      <div className="h-4 w-24 rounded bg-[var(--muted)]" />
    </div>
  );
}

function SkeletonRecentItem() {
  return (
    <div className="animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className="h-4 w-4 rounded bg-[var(--muted)]" />
        <div className="h-3 w-16 rounded bg-[var(--muted)]" />
      </div>
      <div className="h-4 w-full rounded bg-[var(--muted)]" />
      <div className="mt-2 h-3 w-12 rounded bg-[var(--muted)]" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toast — minimal inline implementation
// ---------------------------------------------------------------------------

interface Toast {
  id: number;
  message: string;
  variant: "success" | "error";
}

let _toastId = 0;

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function show(message: string, variant: "success" | "error" = "success") {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  return { toasts, show };
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [seedStatus, setSeedStatus] = useState<SeedStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { toasts, show } = useToast();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  async function fetchAll() {
    setLoading(true);
    try {
      const [s, ss] = await Promise.all([
        apiGet<DashboardStats>("/api/v1/dashboard/stats"),
        apiGet<SeedStatus>("/api/v1/seed/status"),
      ]);
      setStats(s);
      setSeedStatus(ss);
    } catch {
      show("Failed to load dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  async function handleSeed() {
    setActionLoading(true);
    try {
      const result = await apiPost<{ message: string }>("/api/v1/seed/");
      show(result.message);
      await fetchAll();
    } catch {
      show("Failed to seed demo data.", "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleClear() {
    setConfirmClear(false);
    setActionLoading(true);
    try {
      const result = await apiDelete<{ message: string }>("/api/v1/seed/");
      show(result.message);
      await fetchAll();
    } catch {
      show("Failed to clear demo data.", "error");
    } finally {
      setActionLoading(false);
    }
  }

  const quickActions = [
    {
      label: "Generate Content",
      href: "/generate/text",
      icon: Wand2,
      accent: "bg-[#EC4899]",
      textAccent: "text-white",
    },
    {
      label: "Browse Templates",
      href: "/templates",
      icon: Grid,
      accent: "bg-[var(--muted)]",
      textAccent: "text-[var(--foreground)]",
    },
    {
      label: "Open Copilot",
      href: "/copilot",
      icon: Bot,
      accent: "bg-[var(--muted)]",
      textAccent: "text-[var(--foreground)]",
    },
    {
      label: "Manage Brand Kit",
      href: "/brand-kit",
      icon: Palette,
      accent: "bg-[var(--muted)]",
      textAccent: "text-[var(--foreground)]",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Toast stack */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
              t.variant === "success"
                ? "bg-[#EC4899] text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Page header */}
      <div>
        <h1 className="text-3xl font-black text-[var(--foreground)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{today}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              icon={<Package className="h-5 w-5 text-[#EC4899]" />}
              value={String(stats?.asset_count ?? 0)}
              label="Total Assets"
              accent="bg-pink-50 dark:bg-pink-950/30"
            />
            <StatCard
              icon={<Wand2 className="h-5 w-5 text-[#8B5CF6]" />}
              value={String(stats?.generation_count ?? 0)}
              label="Generations"
              accent="bg-purple-50 dark:bg-purple-950/30"
            />
            <StatCard
              icon={<Layers className="h-5 w-5 text-sky-500" />}
              value={String(stats?.template_count ?? 0)}
              label="Templates"
              accent="bg-sky-50 dark:bg-sky-950/30"
            />
            <StatCard
              icon={<Palette className="h-5 w-5 text-amber-500" />}
              value={stats?.active_brand_kit ?? "None"}
              label="Active Brand Kit"
              accent="bg-amber-50 dark:bg-amber-950/30"
              valueSmall
            />
          </>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className={`flex flex-col items-center gap-2 rounded-2xl px-4 py-5 text-center text-sm font-semibold transition-opacity hover:opacity-90 ${a.accent} ${a.textAccent}`}
            >
              <a.icon className="h-6 w-6" />
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">Recent Activity</h2>
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonRecentItem key={i} />
            ))}
          </div>
        ) : !stats?.recent_items.length ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] py-12 text-center text-sm text-[var(--muted-foreground)]">
            Nothing yet — generate your first creation!
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.recent_items.map((item) => {
              const href =
                item.type === "asset"
                  ? `/assets/${item.id}`
                  : `/generate/text`;
              return (
                <Link
                  key={item.id}
                  href={href}
                  className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                    <RecentItemIcon type={item.type} title={item.title} />
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.type === "asset"
                          ? "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm font-medium text-[var(--foreground)]">
                    {item.title}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {timeAgo(item.created_at)}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Demo data controls */}
      <div>
        <hr className="border-[var(--border)]" />
        <div className="mt-6 space-y-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">Demo Data</h2>
          {seedStatus && (
            <p className="text-sm text-[var(--muted-foreground)]">
              {totalSeeded(seedStatus)} seeded items across all sections
            </p>
          )}
          {!confirmClear ? (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSeed}
                disabled={actionLoading}
                className="rounded-xl bg-[#EC4899] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {actionLoading ? "Working…" : "Re-seed Demo Data"}
              </button>
              <button
                onClick={() => setConfirmClear(true)}
                disabled={actionLoading}
                className="rounded-xl border border-red-500 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/30"
              >
                Clear Demo Data
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-[var(--muted-foreground)]">
                Are you sure? This will delete all seeded records.
              </span>
              <button
                onClick={handleClear}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Yes, clear it
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)]"
              >
                Cancel
              </button>
            </div>
          )}
          <p className="text-xs text-[var(--muted-foreground)]">
            Clearing demo data will not affect your own creations.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatCard sub-component
// ---------------------------------------------------------------------------

function StatCard({
  icon,
  value,
  label,
  accent,
  valueSmall,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  accent: string;
  valueSmall?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
        {icon}
      </div>
      <div
        className={`font-black text-[var(--foreground)] ${
          valueSmall ? "text-lg leading-tight" : "text-3xl"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-sm text-[var(--muted-foreground)]">{label}</div>
    </div>
  );
}
