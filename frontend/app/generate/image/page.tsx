"use client";

import { useState } from "react";
import { PromptInput } from "@/components/prompt-input";
import { GenerationProgress } from "@/components/progress-bar";
import { ResultGallery, type CreationResult } from "@/components/result-gallery";

const templates = [
  "A futuristic city at sunset with flying cars",
  "Minimalist product photography of a perfume bottle",
  "Cute corgi astronaut floating in space",
  "Abstract watercolor landscape with mountains",
];

export default function GenerateImagePage() {
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<CreationResult[]>([]);

  function handleSubmit() {
    setGenerating(true);
  }

  function handleComplete() {
    setGenerating(false);
    const newResult: CreationResult = {
      id: Math.random().toString(36).slice(2),
      type: "image",
      title: `Image #${results.length + 1}`,
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
        <h1 className="text-2xl font-bold text-gray-900">Image Generator</h1>
        <p className="text-gray-500">Turn your ideas into stunning visuals.</p>
      </div>

      <PromptInput
        templates={templates}
        placeholder="Describe the image you want to generate..."
        onSubmit={handleSubmit}
        disabled={generating}
      />

      <GenerationProgress isGenerating={generating} onComplete={handleComplete} />

      {results.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Gallery</h2>
          <ResultGallery results={results} onDelete={handleDelete} />
        </div>
      )}
    </div>
  );
}
