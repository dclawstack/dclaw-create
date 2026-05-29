"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "social_post" | "ad" | "thumbnail" | "banner" | "story" | "email";

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: Category;
  platform: string | null;
  width: number;
  height: number;
  thumbnail_url: string | null;
  is_featured: boolean;
  is_seeded: boolean;
  created_at: string;
}

type CategoryFilter = "all" | Category;
type PlatformFilter =
  | "all"
  | "Instagram"
  | "Twitter"
  | "Facebook"
  | "YouTube"
  | "TikTok"
  | "LinkedIn";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLOR: Record<Category, string> = {
  social_post: "bg-pink-400",
  ad: "bg-purple-500",
  thumbnail: "bg-blue-500",
  banner: "bg-green-500",
  story: "bg-orange-400",
  email: "bg-yellow-400",
};

const CATEGORY_LABEL: Record<Category, string> = {
  social_post: "Social Post",
  ad: "Ad",
  thumbnail: "Thumbnail",
  banner: "Banner",
  story: "Story",
  email: "Email",
};

const CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[];

const CATEGORY_TABS: { label: string; value: CategoryFilter }[] = [
  { label: "All", value: "all" },
  ...CATEGORIES.map((c) => ({ label: CATEGORY_LABEL[c], value: c as CategoryFilter })),
];

const PLATFORM_CHIPS: { label: string; value: PlatformFilter }[] = [
  { label: "All", value: "all" },
  { label: "Instagram", value: "Instagram" },
  { label: "Twitter", value: "Twitter" },
  { label: "Facebook", value: "Facebook" },
  { label: "YouTube", value: "YouTube" },
  { label: "TikTok", value: "TikTok" },
  { label: "LinkedIn", value: "LinkedIn" },
];

const PLATFORMS = ["Instagram", "Twitter", "Facebook", "YouTube", "TikTok", "LinkedIn"];

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  highlighted,
  onDelete,
}: {
  template: Template;
  highlighted: boolean;
  onDelete: (id: string) => void;
}) {
  const aspectPercent = Math.min((template.height / template.width) * 100, 120);
  const colorClass = CATEGORY_COLOR[template.category] ?? "bg-gray-300";

  return (
    <div
      className={`rounded-xl border bg-[var(--card)] flex flex-col overflow-hidden transition-shadow hover:shadow-md ${
        highlighted ? "ring-2 ring-[#EC4899]" : ""
      }`}
    >
      {/* Thumbnail — padding-top aspect-ratio trick */}
      <div className="relative w-full" style={{ paddingTop: `${aspectPercent}%` }}>
        <div className={`absolute inset-0 ${colorClass} flex items-center justify-center`}>
          {template.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={template.thumbnail_url}
              alt={template.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-white/70 text-sm font-medium select-none">
              {template.width} × {template.height}
            </span>
          )}
        </div>
        <Badge className="absolute top-2 left-2 bg-black/50 text-white border-0 text-xs pointer-events-none">
          {CATEGORY_LABEL[template.category]}
        </Badge>
        {template.platform && (
          <Badge className="absolute top-2 right-2 bg-black/50 text-white border-0 text-xs pointer-events-none">
            {template.platform}
          </Badge>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1 p-3">
        <div className="font-medium text-sm text-[var(--foreground)] truncate">{template.name}</div>
        <div className="text-xs text-[var(--muted-foreground)]">
          {template.width} × {template.height}
        </div>
        <div className="flex gap-2 mt-2">
          <Button className="flex-1 bg-[#EC4899] hover:opacity-90 text-white text-xs h-8">
            Use Template
          </Button>
          <Button
            variant="outline"
            className="h-8 px-2 text-xs text-red-500 border-red-200 hover:bg-red-50"
            onClick={() => onDelete(template.id)}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── New Template Dialog ──────────────────────────────────────────────────────

function NewTemplateDialog({ onCreated }: { onCreated: (t: Template) => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("social_post");
  const [platform, setPlatform] = useState("");
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1080);
  const [saving, setSaving] = useState(false);
  const closeRef = useRef<HTMLSpanElement>(null);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const t = await apiPost<Template>("/api/v1/templates", {
        name: name.trim(),
        category,
        ...(platform ? { platform } : {}),
        width,
        height,
      });
      onCreated(t);
      setName("");
      setCategory("social_post");
      setPlatform("");
      setWidth(1080);
      setHeight(1080);
      closeRef.current?.querySelector("button")?.click();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#EC4899] hover:opacity-90 text-white">New Template</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Template</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tpl-name">Name</Label>
            <Input
              id="tpl-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Instagram Square"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tpl-category">Category</Label>
            <Select
              id="tpl-category"
              value={category}
              onValueChange={(v) => setCategory(v as Category)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tpl-platform">Platform (optional)</Label>
            <Select id="tpl-platform" value={platform} onValueChange={setPlatform}>
              <option value="">None</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tpl-width">Width (px)</Label>
              <Input
                id="tpl-width"
                type="number"
                min={1}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tpl-height">Height (px)</Label>
              <Input
                id="tpl-height"
                type="number"
                min={1}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <span ref={closeRef}>
            <DialogClose>Cancel</DialogClose>
          </span>
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="bg-[#EC4899] hover:opacity-90 text-white"
          >
            {saving ? "Creating…" : "Create Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [aiPrompt, setAiPrompt] = useState("");
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const [aiLoading, setAiLoading] = useState(false);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTemplates = useCallback(async (cat: CategoryFilter, plat: PlatformFilter) => {
    const params = new URLSearchParams();
    if (cat !== "all") params.set("category", cat);
    if (plat !== "all") params.set("platform", plat);
    params.set("limit", "50");
    try {
      const data = await apiGet<Template[]>(`/api/v1/templates?${params.toString()}`);
      setTemplates(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchTemplates(category, platform);
  }, [category, platform, fetchTemplates]);

  const handleAiRecommend = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await apiPost<{ templates: Template[]; matched_on: string }>(
        "/api/v1/templates/recommend",
        { prompt: aiPrompt.trim() }
      );
      const ids = new Set(res.templates.map((t) => t.id));
      setHighlightedIds(ids);
      // Surface recommended templates at the top (dedup)
      setTemplates((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const newOnes = res.templates.filter((t) => !existingIds.has(t.id));
        return [...newOnes, ...prev];
      });
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = setTimeout(() => setHighlightedIds(new Set()), 10000);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/api/v1/templates/${id}`);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreated = (t: Template) => {
    setTemplates((prev) => [t, ...prev]);
  };

  const featuredTemplates = templates.filter((t) => t.is_featured);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Template Gallery</h1>
        <NewTemplateDialog onCreated={handleCreated} />
      </div>

      {/* AI Recommendation bar */}
      <div className="flex gap-2">
        <Input
          placeholder="Describe what you need (e.g. Instagram story for a product launch)…"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAiRecommend()}
          className="flex-1"
        />
        <Button
          onClick={handleAiRecommend}
          disabled={aiLoading || !aiPrompt.trim()}
          className="bg-[#8B5CF6] hover:opacity-90 text-white whitespace-nowrap"
        >
          {aiLoading ? "Finding…" : "Find Templates"}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-1 rounded-lg bg-[var(--muted)] p-1 w-fit">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setCategory(tab.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                category === tab.value
                  ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Platform chips */}
        <div className="flex flex-wrap gap-2">
          {PLATFORM_CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setPlatform(chip.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                platform === chip.value
                  ? "bg-[#EC4899] text-white border-[#EC4899]"
                  : "bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)] hover:border-[#EC4899] hover:text-[#EC4899]"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured section */}
      {featuredTemplates.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">Featured</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {featuredTemplates.map((t) => (
              <div key={t.id} className="w-56 flex-shrink-0">
                <TemplateCard
                  template={t}
                  highlighted={highlightedIds.has(t.id)}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main grid */}
      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-[var(--muted-foreground)]">
            No templates found. Create one or adjust your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              highlighted={highlightedIds.has(t.id)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
