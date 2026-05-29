"use client";

import React, { useEffect, useState, useRef } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
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

interface BrandColor {
  name: string;
  hex: string;
  role: string;
}

interface BrandFont {
  name: string;
  url: string | null;
  role: string;
}

interface BrandKit {
  id: string;
  name: string;
  colors: BrandColor[];
  fonts: BrandFont[];
  logo_url: string | null;
  voice_guidelines: string | null;
  is_active: boolean;
  is_seeded: boolean;
  created_at: string;
}

type BrandKitPayload = {
  name: string;
  colors: BrandColor[];
  fonts: BrandFont[];
  voice_guidelines: string | null;
};

const FONT_ROLES = ["heading", "body", "caption"];
const COLOR_ROLES = ["primary", "secondary", "accent", "background", "text"];

// ─── Color Picker Input ───────────────────────────────────────────────────────

function ColorInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded border border-[var(--border)] flex-shrink-0 cursor-pointer overflow-hidden relative"
        title="Pick color"
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="w-full h-full rounded" style={{ backgroundColor: value }} />
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="font-mono text-sm"
      />
    </div>
  );
}

// ─── Brand Kit Form (shared by create + edit dialogs) ────────────────────────

function BrandKitForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: BrandKitPayload;
  onSave: (payload: BrandKitPayload) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [voiceGuidelines, setVoiceGuidelines] = useState(initial?.voice_guidelines ?? "");
  const [colors, setColors] = useState<BrandColor[]>(initial?.colors ?? []);
  const [fonts, setFonts] = useState<BrandFont[]>(initial?.fonts ?? []);

  // Add-color form state
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [newColorRole, setNewColorRole] = useState("primary");

  // Add-font form state
  const [newFontName, setNewFontName] = useState("");
  const [newFontRole, setNewFontRole] = useState("heading");

  const [saving, setSaving] = useState(false);

  const addColor = () => {
    if (!newColorName.trim() || !newColorHex.trim()) return;
    setColors((prev) => [
      ...prev,
      { name: newColorName.trim(), hex: newColorHex, role: newColorRole },
    ]);
    setNewColorName("");
    setNewColorHex("#000000");
    setNewColorRole("primary");
  };

  const removeColor = (idx: number) => {
    setColors((prev) => prev.filter((_, i) => i !== idx));
  };

  const addFont = () => {
    if (!newFontName.trim()) return;
    setFonts((prev) => [...prev, { name: newFontName.trim(), url: null, role: newFontRole }]);
    setNewFontName("");
    setNewFontRole("heading");
  };

  const removeFont = (idx: number) => {
    setFonts((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        colors,
        fonts,
        voice_guidelines: voiceGuidelines.trim() || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1">
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bk-name">Name</Label>
        <Input
          id="bk-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. My Brand"
        />
      </div>

      {/* Colors */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[var(--foreground)]">Colors</span>
        {colors.length > 0 && (
          <div className="flex flex-col gap-1">
            {colors.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2"
              >
                <div
                  className="w-5 h-5 rounded-full border border-[var(--border)] flex-shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="flex-1 text-sm text-[var(--foreground)]">{c.name}</span>
                <span className="text-xs text-[var(--muted-foreground)] font-mono">{c.hex}</span>
                <Badge className="text-xs">{c.role}</Badge>
                <button
                  type="button"
                  onClick={() => removeColor(i)}
                  className="text-[var(--muted-foreground)] hover:text-red-500 text-lg leading-none ml-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {/* Add color form */}
        <div className="rounded-lg border border-dashed border-[var(--border)] p-3 flex flex-col gap-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nc-name">Color name</Label>
            <Input
              id="nc-name"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              placeholder="e.g. Brand Blue"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Hex</Label>
            <ColorInput value={newColorHex} onChange={setNewColorHex} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nc-role">Role</Label>
            <Select id="nc-role" value={newColorRole} onValueChange={setNewColorRole}>
              {COLOR_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full mt-1"
            onClick={addColor}
            disabled={!newColorName.trim()}
          >
            Add Color
          </Button>
        </div>
      </div>

      {/* Fonts */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[var(--foreground)]">Fonts</span>
        {fonts.length > 0 && (
          <div className="flex flex-col gap-1">
            {fonts.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2"
              >
                <span className="flex-1 text-sm text-[var(--foreground)]">{f.name}</span>
                <Badge className="text-xs">{f.role}</Badge>
                <button
                  type="button"
                  onClick={() => removeFont(i)}
                  className="text-[var(--muted-foreground)] hover:text-red-500 text-lg leading-none ml-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {/* Add font form */}
        <div className="rounded-lg border border-dashed border-[var(--border)] p-3 flex flex-col gap-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nf-name">Font name</Label>
            <Input
              id="nf-name"
              value={newFontName}
              onChange={(e) => setNewFontName(e.target.value)}
              placeholder="e.g. Inter"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nf-role">Role</Label>
            <Select id="nf-role" value={newFontRole} onValueChange={setNewFontRole}>
              {FONT_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full mt-1"
            onClick={addFont}
            disabled={!newFontName.trim()}
          >
            Add Font
          </Button>
        </div>
      </div>

      {/* Voice guidelines */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bk-voice">Voice Guidelines</Label>
        <textarea
          id="bk-voice"
          value={voiceGuidelines}
          onChange={(e) => setVoiceGuidelines(e.target.value)}
          rows={3}
          placeholder="Describe your brand voice, tone, and messaging guidelines…"
          className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#EC4899] resize-none"
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="bg-[#EC4899] hover:opacity-90 text-white"
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </DialogFooter>
    </div>
  );
}

// ─── Brand Kit Card ───────────────────────────────────────────────────────────

function BrandKitCard({
  kit,
  onSetActive,
  onEdit,
  onDelete,
}: {
  kit: BrandKit;
  onSetActive: (id: string) => void;
  onEdit: (kit: BrandKit) => void;
  onDelete: (id: string) => void;
}) {
  const visibleColors = kit.colors.slice(0, 5);
  const voicePreview = kit.voice_guidelines
    ? kit.voice_guidelines.length > 100
      ? kit.voice_guidelines.slice(0, 100) + "…"
      : kit.voice_guidelines
    : null;

  return (
    <div className="rounded-xl border bg-[var(--card)] flex flex-col gap-3 p-4">
      {/* Name + active badge */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-[var(--foreground)]">{kit.name}</span>
        {kit.is_active && (
          <Badge className="bg-[#EC4899] text-white border-0 text-xs">Active</Badge>
        )}
      </div>

      {/* Color palette strip */}
      {visibleColors.length > 0 && (
        <div className="flex items-center gap-2">
          {visibleColors.map((c, i) => (
            <div key={i} className="relative group">
              <div
                className="w-7 h-7 rounded-full border border-[var(--border)] cursor-default"
                style={{ backgroundColor: c.hex }}
                title={`${c.name} — ${c.hex}`}
              />
              {/* Hex tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs rounded px-1.5 py-0.5 whitespace-nowrap font-mono">
                  {c.hex}
                </div>
              </div>
            </div>
          ))}
          {kit.colors.length > 5 && (
            <span className="text-xs text-[var(--muted-foreground)]">
              +{kit.colors.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Font list */}
      {kit.fonts.length > 0 && (
        <div className="flex flex-col gap-1">
          {kit.fonts.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sm text-[var(--foreground)]">{f.name}</span>
              <Badge variant="outline" className="text-xs capitalize">
                {f.role}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Voice guidelines preview */}
      {voicePreview && (
        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{voicePreview}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-1">
        {!kit.is_active && (
          <Button
            variant="outline"
            className="flex-1 text-xs h-8"
            onClick={() => onSetActive(kit.id)}
          >
            Set Active
          </Button>
        )}
        <Button
          variant="outline"
          className="flex-1 text-xs h-8"
          onClick={() => onEdit(kit)}
        >
          Edit
        </Button>
        <Button
          variant="outline"
          className="flex-1 text-xs h-8 text-red-500 border-red-200 hover:bg-red-50"
          onClick={() => onDelete(kit.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BrandKitPage() {
  const [kits, setKits] = useState<BrandKit[]>([]);
  const [editingKit, setEditingKit] = useState<BrandKit | null>(null);
  const newDialogCloseRef = useRef<HTMLSpanElement>(null);
  const editDialogCloseRef = useRef<HTMLSpanElement>(null);
  const editDialogTriggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    fetchKits();
  }, []);

  // Auto-open the edit dialog whenever editingKit is set
  useEffect(() => {
    if (editingKit) {
      const btn = editDialogTriggerRef.current?.querySelector("button");
      btn?.click();
    }
  }, [editingKit]);

  const fetchKits = async () => {
    try {
      const data = await apiGet<BrandKit[]>("/api/v1/brand-kits");
      setKits(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (payload: BrandKitPayload) => {
    const kit = await apiPost<BrandKit>("/api/v1/brand-kits", payload);
    setKits((prev) => [kit, ...prev]);
    newDialogCloseRef.current?.querySelector("button")?.click();
  };

  const handleEdit = async (payload: BrandKitPayload) => {
    if (!editingKit) return;
    const updated = await apiPut<BrandKit>(`/api/v1/brand-kits/${editingKit.id}`, payload);
    setKits((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
    setEditingKit(null);
    editDialogCloseRef.current?.querySelector("button")?.click();
  };

  const handleSetActive = async (id: string) => {
    try {
      await apiPost(`/api/v1/brand-kits/${id}/set-active`);
      setKits((prev) =>
        prev.map((k) => ({ ...k, is_active: k.id === id }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/api/v1/brand-kits/${id}`);
      setKits((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const activeKit = kits.find((k) => k.is_active);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Brand Kit</h1>

        {/* New Brand Kit dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#EC4899] hover:opacity-90 text-white">New Brand Kit</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>New Brand Kit</DialogTitle>
            </DialogHeader>
            <span ref={newDialogCloseRef} className="sr-only">
              <DialogClose />
            </span>
            <BrandKitForm
              onSave={handleCreate}
              onCancel={() => newDialogCloseRef.current?.querySelector("button")?.click()}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Active kit banner */}
      {activeKit && (
        <div className="rounded-xl bg-[#EC4899] px-5 py-3 flex items-center gap-3">
          <span className="text-white font-medium">Active:</span>
          <span className="text-white">{activeKit.name}</span>
        </div>
      )}

      {/* Edit dialog — hidden trigger; auto-opened via useEffect when editingKit is set */}
      <Dialog>
        <span ref={editDialogTriggerRef} className="hidden">
          <DialogTrigger />
        </span>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Brand Kit</DialogTitle>
          </DialogHeader>
          <span ref={editDialogCloseRef} className="sr-only">
            <DialogClose />
          </span>
          {editingKit && (
            <BrandKitForm
              key={editingKit.id}
              initial={{
                name: editingKit.name,
                colors: editingKit.colors,
                fonts: editingKit.fonts,
                voice_guidelines: editingKit.voice_guidelines,
              }}
              onSave={handleEdit}
              onCancel={() => {
                setEditingKit(null);
                editDialogCloseRef.current?.querySelector("button")?.click();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Kits grid */}
      {kits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-[var(--muted-foreground)]">
            No brand kits yet. Create your first one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {kits.map((kit) => (
            <BrandKitCard
              key={kit.id}
              kit={kit}
              onSetActive={handleSetActive}
              onEdit={(k) => setEditingKit(k)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
