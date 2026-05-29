"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// ─── Types ────────────────────────────────────────────────────────────────────

type ProviderType = "openrouter" | "ollama" | "openai";

interface Provider {
  id: string;
  name: string;
  display_name: string;
  provider_type: ProviderType;
  api_key: string | null;
  base_url: string;
  model_name: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
}

interface ProviderFormData {
  display_name: string;
  provider_type: ProviderType;
  model_name: string;
  base_url: string;
  api_key: string;
}

interface TestResult {
  providerId: string;
  success: boolean;
  message: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_URLS: Record<ProviderType, string> = {
  openrouter: "https://openrouter.ai/api/v1",
  ollama: "http://localhost:11434",
  openai: "https://api.openai.com/v1",
};

const MODEL_PLACEHOLDERS: Record<ProviderType, string> = {
  openrouter: "moonshotai/kimi-k2.5",
  ollama: "llama3",
  openai: "gpt-4o",
};

const EMPTY_FORM: ProviderFormData = {
  display_name: "",
  provider_type: "openrouter",
  model_name: "",
  base_url: DEFAULT_URLS.openrouter,
  api_key: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function maskApiKey(key: string | null): string {
  if (!key) return "Not set";
  if (key.length <= 8) return "***";
  return `${key.slice(0, 3)}***...***${key.slice(-3)}`;
}

// ─── Add/Edit Dialog ──────────────────────────────────────────────────────────

interface ProviderDialogProps {
  editingProvider: Provider | null;
  onClose: () => void;
  onSaved: (provider: Provider) => void;
}

function ProviderDialog({ editingProvider, onClose, onSaved }: ProviderDialogProps) {
  const [form, setForm] = useState<ProviderFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingProvider) {
      setForm({
        display_name: editingProvider.display_name,
        provider_type: editingProvider.provider_type,
        model_name: editingProvider.model_name,
        base_url: editingProvider.base_url,
        api_key: "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(null);
  }, [editingProvider]);

  function handleTypeChange(type: ProviderType) {
    setForm((prev) => ({
      ...prev,
      provider_type: type,
      base_url: DEFAULT_URLS[type],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const body = {
      display_name: form.display_name,
      provider_type: form.provider_type,
      model_name: form.model_name,
      base_url: form.base_url,
      name: form.display_name.toLowerCase().replace(/\s+/g, "-"),
      ...(form.api_key ? { api_key: form.api_key } : {}),
    };

    try {
      let saved: Provider;
      if (editingProvider) {
        saved = await apiPut<Provider>(`/api/v1/llm-providers/${editingProvider.id}`, body);
      } else {
        saved = await apiPost<Provider>("/api/v1/llm-providers", body);
      }
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save provider");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative z-50 bg-[var(--card)] rounded-lg border border-[var(--border)] p-6 shadow-lg w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {editingProvider ? "Edit Provider" : "Add Provider"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-xl leading-none"
          >
            &#x2715;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              required
              value={form.display_name}
              onChange={(e) => setForm((p) => ({ ...p, display_name: e.target.value }))}
              placeholder="My OpenRouter Provider"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="provider_type">Provider Type</Label>
            <Select
              id="provider_type"
              value={form.provider_type}
              onValueChange={(v) => handleTypeChange(v as ProviderType)}
            >
              <option value="openrouter">OpenRouter</option>
              <option value="ollama">Ollama</option>
              <option value="openai">OpenAI</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="model_name">Model Name</Label>
            <Input
              id="model_name"
              required
              value={form.model_name}
              onChange={(e) => setForm((p) => ({ ...p, model_name: e.target.value }))}
              placeholder={MODEL_PLACEHOLDERS[form.provider_type]}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="base_url">Base URL</Label>
            <Input
              id="base_url"
              required
              value={form.base_url}
              onChange={(e) => setForm((p) => ({ ...p, base_url: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="api_key">
              API Key{form.provider_type === "ollama" ? " (optional)" : ""}
            </Label>
            <Input
              id="api_key"
              type="password"
              value={form.api_key}
              onChange={(e) => setForm((p) => ({ ...p, api_key: e.target.value }))}
              placeholder={editingProvider ? "Leave blank to keep existing key" : "sk-..."}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Provider Card ────────────────────────────────────────────────────────────

interface ProviderCardProps {
  provider: Provider;
  onEdit: (p: Provider) => void;
  onDeleted: (id: string) => void;
  onSetDefault: (p: Provider) => void;
  testResult: TestResult | null;
  onTest: (p: Provider) => void;
  testing: boolean;
}

function ProviderCard({
  provider,
  onEdit,
  onDeleted,
  onSetDefault,
  testResult,
  onTest,
  testing,
}: ProviderCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiDelete(`/api/v1/llm-providers/${provider.id}`);
      onDeleted(provider.id);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[var(--foreground)] truncate">
              {provider.display_name}
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">
              {provider.base_url}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {provider.is_default && (
              <Badge className="bg-[#EC4899] text-white">Default</Badge>
            )}
            <Badge variant={provider.is_active ? undefined : "secondary"}>
              {provider.is_active ? (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  Active
                </span>
              ) : (
                "Inactive"
              )}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <span className="text-[var(--muted-foreground)] text-xs uppercase tracking-wide">
              Type
            </span>
            <p className="text-[var(--foreground)] font-medium capitalize mt-0.5">
              {provider.provider_type}
            </p>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)] text-xs uppercase tracking-wide">
              Model
            </span>
            <p className="text-[var(--foreground)] font-medium mt-0.5 truncate">
              {provider.model_name}
            </p>
          </div>
          <div className="col-span-2">
            <span className="text-[var(--muted-foreground)] text-xs uppercase tracking-wide">
              API Key
            </span>
            <p className="text-[var(--foreground)] font-mono text-xs mt-0.5">
              {maskApiKey(provider.api_key)}
            </p>
          </div>
        </div>

        {testResult && (
          <div
            className={`text-xs rounded px-3 py-2 ${
              testResult.success
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {testResult.success ? "✓ " : "✗ "}
            {testResult.message}
          </div>
        )}

        {confirmDelete ? (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-sm text-[var(--muted-foreground)] flex-1">
              Are you sure?
            </span>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Confirm"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" variant="outline" onClick={() => onEdit(provider)}>
              Edit
            </Button>
            {!provider.is_default && (
              <Button size="sm" variant="outline" onClick={() => onSetDefault(provider)}>
                Set Default
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTest(provider)}
              disabled={testing}
            >
              {testing ? "Testing…" : "Test Connection"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AIProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [testingId, setTestingId] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Provider[]>("/api/v1/llm-providers")
      .then(setProviders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function openAdd() {
    setEditingProvider(null);
    setDialogOpen(true);
  }

  function openEdit(provider: Provider) {
    setEditingProvider(provider);
    setDialogOpen(true);
  }

  function handleSaved(saved: Provider) {
    setProviders((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
  }

  function handleDeleted(id: string) {
    setProviders((prev) => prev.filter((p) => p.id !== id));
    setTestResults((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function handleSetDefault(provider: Provider) {
    try {
      await apiPost(`/api/v1/llm-providers/${provider.id}/set-default`);
      setProviders((prev) =>
        prev.map((p) => ({ ...p, is_default: p.id === provider.id }))
      );
    } catch (err) {
      console.error("Failed to set default:", err);
    }
  }

  async function handleTest(provider: Provider) {
    setTestingId(provider.id);
    try {
      const result = await apiPost<{ success: boolean; message: string }>(
        `/api/v1/llm-providers/${provider.id}/test-connection`
      );
      setTestResults((prev) => ({
        ...prev,
        [provider.id]: { providerId: provider.id, ...result },
      }));
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [provider.id]: {
          providerId: provider.id,
          success: false,
          message: err instanceof Error ? err.message : "Connection failed",
        },
      }));
    } finally {
      setTestingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">AI Providers</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Configure LLM providers for content generation.
          </p>
        </div>
        <Button onClick={openAdd}>Add Provider</Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-sm text-[var(--muted-foreground)]">Loading providers…</div>
      ) : providers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
          <p className="text-[var(--muted-foreground)]">
            No providers configured. Add one to start generating content.
          </p>
          <Button className="mt-4" onClick={openAdd}>
            Add Provider
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onEdit={openEdit}
              onDeleted={handleDeleted}
              onSetDefault={handleSetDefault}
              testResult={testResults[provider.id] ?? null}
              onTest={handleTest}
              testing={testingId === provider.id}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      {dialogOpen && (
        <ProviderDialog
          editingProvider={editingProvider}
          onClose={() => setDialogOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
