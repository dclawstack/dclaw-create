"use client";

import { useState } from "react";
import { PromptInput } from "@/components/prompt-input";
import { GenerationProgress } from "@/components/progress-bar";
import { ResultGallery, type CreationResult } from "@/components/result-gallery";

const templates = [
  "Calm meditation voiceover for a wellness app",
  "Energetic podcast intro with electronic music",
  "Professional voicemail greeting",
  "Audiobook narration of a fantasy prologue",
];

export default function GenerateAudioPage() {
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<CreationResult[]>([]);

  function handleSubmit() {
    setGenerating(true);
  }

  function handleComplete() {
    setGenerating(false);
    const newResult: CreationResult = {
      id: Math.random().toString(36).slice(2),
      type: "audio",
      title: `Audio #${results.length + 1}`,
      createdAt: "Just now",
    };
    setResults((prev) => [newResult, ...prev]);
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

      <PromptInput
        templates={templates}
        placeholder="Describe the audio you want to create..."
        onSubmit={handleSubmit}
        disabled={generating}
      />

      <GenerationProgress isGenerating={generating} onComplete={handleComplete} />

      {results.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Library</h2>
          <ResultGallery results={results} onDelete={handleDelete} />
        </div>
      )}
    </div>
  );
}
