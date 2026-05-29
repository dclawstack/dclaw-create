"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";


// ─── Types ────────────────────────────────────────────────────────────────────

type AssetType = "image" | "video" | "audio" | "text";

interface AssetTag {
  id: string;
  tag: string;
  source: string;
}

interface Asset {
  id: string;
  title: string;
  asset_type: AssetType;
  file_url?: string;
  created_at: string;
  updated_at: string;
  tags: AssetTag[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TYPE_COLORS: Record<AssetType, string> = {
  image: "bg-pink-100 text-pink-700",
  video: "bg-purple-100 text-purple-700",
  audio: "bg-blue-100 text-blue-700",
  text: "bg-gray-100 text-gray-700",
};

const TYPE_PLACEHOLDER_BG: Record<AssetType, string> = {
  image: "bg-pink-100",
  video: "bg-purple-100",
  audio: "bg-blue-100",
  text: "bg-gray-100",
};

const TYPE_PLACEHOLDER_ICON: Record<AssetType, string> = {
  image: "🖼️",
  video: "🎬",
  audio: "🎵",
  text: "📄",
};

type FilterType = "all" | AssetType;

// ─── Add Asset Dialog ─────────────────────────────────────────────────────────

function AddAssetDialog({ onCreated }: { onCreated: (asset: Asset) => void }) {
  const [title, setTitle] = useState("");
  const [assetType, setAssetType] = useState<AssetType>("image");
  const [fileUrl, setFileUrl] = useState("");
  const [saving, setSaving] = useState(false);
  // Ref to the wrapper span; we click the inner DialogClose button to close.
  const closeWrapperRef = useRef<HTMLSpanElement>(null);

  const closeDialog = () => {
    const btn = closeWrapperRef.current?.querySelector("button");
    btn?.click();
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const asset = await apiPost<Asset>("/api/v1/assets", {
        title: title.trim(),
        asset_type: assetType,
        ...(fileUrl.trim() ? { file_url: fileUrl.trim() } : {}),
      });
      onCreated(asset);
      setTitle("");
      setAssetType("image");
      setFileUrl("");
      closeDialog();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-brand-pink hover:opacity-90 text-white">
          Add Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="asset-title">Title *</Label>
            <Input
              id="asset-title"
              placeholder="Enter asset title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="asset-type">Type</Label>
            <Select
              id="asset-type"
              value={assetType}
              onValueChange={(v) => setAssetType(v as AssetType)}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="text">Text</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="asset-url">File URL (optional)</Label>
            <Input
              id="asset-url"
              placeholder="https://..."
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          {/* Hidden close target for programmatic close after save */}
          <span ref={closeWrapperRef} className="sr-only" aria-hidden>
            <DialogClose />
          </span>
          <DialogClose>
            <span className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)] bg-transparent px-4 py-2 text-sm font-medium hover:bg-[var(--muted)] transition-colors">
              Cancel
            </span>
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="bg-brand-pink hover:opacity-90 text-white"
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Asset Card ───────────────────────────────────────────────────────────────

function AssetCard({ asset, onDelete }: { asset: Asset; onDelete: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);

  const visibleTags = asset.tags.slice(0, 3);
  const extraCount = asset.tags.length - 3;

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] transition-shadow hover:shadow-md"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail / Placeholder */}
      <Link href={`/assets/${asset.id}`} className="block">
        <div className={`relative flex h-40 items-center justify-center ${TYPE_PLACEHOLDER_BG[asset.asset_type]}`}>
          {asset.file_url && asset.asset_type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={asset.file_url}
              alt={asset.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-4xl">{TYPE_PLACEHOLDER_ICON[asset.asset_type]}</span>
          )}

          {/* Type badge overlay */}
          <span
            className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${TYPE_COLORS[asset.asset_type]}`}
          >
            {asset.asset_type}
          </span>
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link href={`/assets/${asset.id}`}>
          <p className="truncate text-sm font-medium text-[var(--foreground)] hover:underline">
            {asset.title}
          </p>
        </Link>
        <p className="text-xs text-[var(--muted-foreground)]">{relativeTime(asset.created_at)}</p>

        {/* Tags */}
        {asset.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {visibleTags.map((t) => (
              <Badge key={t.id} variant="secondary" className="text-xs px-1.5 py-0">
                {t.tag}
              </Badge>
            ))}
            {extraCount > 0 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                +{extraCount} more
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Hover Actions */}
      {hovered && (
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          <button
            className="rounded-md bg-[var(--muted)] px-2 py-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            title="Download (placeholder)"
            onClick={(e) => e.preventDefault()}
          >
            ↓
          </button>
          <button
            className="rounded-md bg-red-50 px-2 py-1 text-xs text-red-500 hover:bg-red-100 transition-colors"
            title="Delete"
            onClick={(e) => {
              e.preventDefault();
              onDelete(asset.id);
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), 300);
  };

  const fetchAssets = useCallback(async (type: FilterType, q: string) => {
    const params = new URLSearchParams();
    if (type !== "all") params.set("asset_type", type);
    if (q.trim()) params.set("search", q.trim());
    params.set("limit", "50");
    try {
      const data = await apiGet<Asset[]>(`/api/v1/assets?${params.toString()}`);
      setAssets(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchAssets(filter, debouncedSearch);
  }, [filter, debouncedSearch, fetchAssets]);

  const handleCreated = (asset: Asset) => {
    setAssets((prev) => [asset, ...prev]);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/api/v1/assets/${id}`);
      setAssets((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filterTabs: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Image", value: "image" },
    { label: "Video", value: "video" },
    { label: "Audio", value: "audio" },
    { label: "Text", value: "text" },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Asset Library</h1>
        <AddAssetDialog onCreated={handleCreated} />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Type filter tabs */}
        <div className="flex gap-1 rounded-lg bg-[var(--muted)] p-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === tab.value
                  ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="sm:ml-auto sm:w-64">
          <Input
            placeholder="Search assets…"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Results Grid */}
      {assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-[var(--muted-foreground)]">
            No assets found. Generate something first!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
