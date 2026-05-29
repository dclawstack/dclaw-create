"use client";

import { useState } from "react";

const DEMO_PROMPTS = [
  "Create a social media campaign for a new fitness app launch",
  "Design a product announcement for a premium coffee brand",
  "Write a promotional video script for a SaaS tool",
  "Generate ad copy for a luxury travel experience",
];

const MOCK_LAYERS = [
  { name: "Brand Headline", type: "copy", color: "#EC4899" },
  { name: "Visual Direction", type: "image", color: "#8B5CF6" },
  { name: "CTA Copy", type: "text", color: "#10B981" },
  { name: "Brand Voice", type: "tone", color: "#F59E0B" },
];

export function CopilotDemo() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<typeof MOCK_LAYERS | null>(null);

  function handleGenerate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setLoading(false);
      setResult(MOCK_LAYERS);
    }, 1200);
  }

  function handleChip(p: string) {
    setPrompt(p);
    setResult(null);
  }

  return (
    <section id="demo" className="py-24 bg-[var(--muted)]/20">
      <div className="mx-auto max-w-6xl px-6">
        {/* Headline */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-brand-pink">
            Watch the creative AI work
          </p>
          <h2 className="text-3xl font-bold text-[var(--foreground)] md:text-4xl">
            Type a prompt, get creative output.
          </h2>
        </div>

        {/* 2-col layout */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left: input */}
          <div className="flex flex-col gap-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to create..."
              rows={5}
              className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-brand-pink/50"
            />
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-pink px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin">✦</span>
              ) : (
                "Generate ✦"
              )}
            </button>

            {/* Example chips */}
            <div className="flex flex-wrap gap-2">
              {DEMO_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => handleChip(p)}
                  className="rounded-lg border border-[var(--border)] bg-[var(--card)]/60 px-3 py-1.5 text-xs text-[var(--muted-foreground)] transition-colors hover:border-brand-pink/50 hover:text-[var(--foreground)]"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Right: result panel */}
          <div className="flex flex-col gap-3">
            {loading && (
              <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)]/60">
                <span className="animate-spin text-3xl text-brand-pink">✦</span>
              </div>
            )}

            {!loading && result && (
              <div className="flex flex-col gap-3">
                {result.map((layer) => (
                  <div
                    key={layer.name}
                    className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3"
                  >
                    <div
                      className="h-3 w-3 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: layer.color }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--foreground)]">{layer.name}</p>
                    </div>
                    <span
                      className="rounded-md px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `${layer.color}20`,
                        color: layer.color,
                      }}
                    >
                      {layer.type}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {!loading && !result && (
              <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-[var(--border)] text-sm text-[var(--muted-foreground)]">
                Your creative output will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
