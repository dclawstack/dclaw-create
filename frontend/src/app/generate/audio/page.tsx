"use client";

import { useEffect, useState } from "react";
import { PromptInput } from "@/components/prompt-input";
import { ResultGallery, type CreationResult } from "@/components/result-gallery";

interface GenerationJob {
  id: string;
  job_type: "text" | "image" | "audio" | "video";
  status: "pending" | "processing" | "completed" | "failed";
  prompt: string;
  result_text: string | null;
  result_url: string | null;
  error_message: string | null;
  created_at: string;
}

const templates = [
  "Calm meditation voiceover for a wellness app",
  "Energetic podcast intro with electronic music",
  "Professional voicemail greeting",
  "Audiobook narration of a fantasy prologue",
];

export default function GenerateAudioPage() {
  const [generating, setGenerating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [results, setResults] = useState<CreationResult[]>([]);

  useEffect(() => {
    fetch("/api/v1/generations?job_type=audio&limit=6")
      .then((r) => r.json())
      .then((data) => {
        const items: CreationResult[] = (data.items ?? []).map((j: GenerationJob) => ({
          id: j.id,
          type: "audio" as const,
          title: j.prompt.slice(0, 40),
          content: j.result_text ?? undefined,
          createdAt: new Date(j.created_at).toLocaleDateString(),
        }));
        setResults(items);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(prompt: string) {
    setGenerating(true);
    setNotification(null);
    try {
      const res = await fetch("/api/v1/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_type: "audio", prompt }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const job: GenerationJob = await res.json();

      const newResult: CreationResult = {
        id: job.id,
        type: "audio",
        title: prompt.slice(0, 40),
        content: job.result_text ?? undefined,
        createdAt: "Just now",
      };
      setResults((prev) => [newResult, ...prev]);

      await fetch("/api/v1/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: prompt.slice(0, 80),
          asset_type: "audio",
          generation_job_id: job.id,
        }),
      });
      setNotification("Saved to Asset Library");
      setTimeout(() => setNotification(null), 3000);
    } catch {
      setNotification("Generation failed. Please try again.");
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setGenerating(false);
    }
  }

  function handleDelete(id: string) {
    setResults((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audio Generator</h1>
        <p className="text-gray-500">Create voiceovers, music, and soundscapes.</p>
      </div>

      {notification && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          {notification}
        </div>
      )}

      <PromptInput
        templates={templates}
        placeholder="Describe the audio you want to create..."
        onSubmit={handleSubmit}
        disabled={generating}
      />

      {generating && (
        <div className="flex items-center gap-3 rounded-xl border bg-white p-4 text-sm text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-create-600 border-t-transparent" />
          Generating…
        </div>
      )}

      {results.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Library</h2>
          <ResultGallery results={results} onDelete={handleDelete} />
        </div>
      )}
    </div>
  );
}
