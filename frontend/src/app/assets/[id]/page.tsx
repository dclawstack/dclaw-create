"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// ─── Types ────────────────────────────────────────────────────────────────────

type AssetType = "image" | "video" | "audio" | "text";

interface AssetTag {
  id: string;
  tag: string;
  source: string;
}

interface Collection {
  id: string;
  name: string;
  description?: string;
}

interface Asset {
  id: string;
  title: string;
  asset_type: AssetType;
  file_url?: string;
  created_at: string;
  updated_at: string;
  tags: AssetTag[];
  collections?: Collection[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

const TYPE_BADGE_CLASS: Record<AssetType, string> = {
  image: "bg-pink-100 text-pink-700",
  video: "bg-purple-100 text-purple-700",
  audio: "bg-blue-100 text-blue-700",
  text: "bg-gray-100 text-gray-700",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [newTag, setNewTag] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiGet<Asset>(`/api/v1/assets/${id}`).then(setAsset).catch(console.error);
  }, [id]);

  const handleAddTag = async () => {
    const tag = newTag.trim();
    if (!tag || !asset) return;
    setAddingTag(true);
    try {
      const created = await apiPost<AssetTag>(`/api/v1/assets/${asset.id}/tags`, {
        tag,
        source: "manual",
      });
      setAsset((prev) => prev ? { ...prev, tags: [...prev.tags, created] } : prev);
      setNewTag("");
    } catch (err) {
      console.error(err);
    } finally {
      setAddingTag(false);
    }
  };

  const handleDelete = async () => {
    if (!asset) return;
    setDeleting(true);
    try {
      await apiDelete(`/api/v1/assets/${asset.id}`);
      router.push("/assets");
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAddTag();
  };

  if (!asset) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[var(--muted-foreground)]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      {/* Back */}
      <button
        onClick={() => router.push("/assets")}
        className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
      >
        ← Back to Asset Library
      </button>

      {/* Preview */}
      <div className={`flex h-64 w-full items-center justify-center overflow-hidden rounded-xl ${TYPE_PLACEHOLDER_BG[asset.asset_type]}`}>
        {asset.file_url && asset.asset_type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.file_url}
            alt={asset.title}
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="text-6xl">{TYPE_PLACEHOLDER_ICON[asset.asset_type]}</span>
        )}
      </div>

      {/* Title + Meta */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{asset.title}</h1>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${TYPE_BADGE_CLASS[asset.asset_type]}`}>
            {asset.asset_type}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-[var(--muted-foreground)]">
          <span>Created: {formatDate(asset.created_at)}</span>
          <span>Updated: {formatDate(asset.updated_at)}</span>
          {asset.file_url && (
            <a
              href={asset.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline truncate max-w-xs"
            >
              View file ↗
            </a>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {asset.tags.map((t) => (
            <Badge key={t.id} variant="secondary">
              {t.tag}
            </Badge>
          ))}
          {asset.tags.length === 0 && (
            <p className="text-sm text-[var(--muted-foreground)]">No tags yet.</p>
          )}
        </div>

        {/* Add Tag */}
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Add tag…"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            className="max-w-xs"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddTag}
            disabled={addingTag || !newTag.trim()}
          >
            {addingTag ? "Adding…" : "Add"}
          </Button>
        </div>
      </div>

      {/* Collections */}
      {asset.collections && asset.collections.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Collections</h2>
          <div className="flex flex-wrap gap-2">
            {asset.collections.map((c) => (
              <Badge key={c.id} variant="outline">
                {c.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Delete */}
      <div className="border-t border-[var(--border)] pt-4">
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting…" : "Delete Asset"}
        </Button>
      </div>
    </div>
  );
}
