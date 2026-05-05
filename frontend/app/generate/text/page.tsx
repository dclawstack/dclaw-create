"use client";

import { useState } from "react";
import { PromptInput } from "@/components/prompt-input";
import { GenerationProgress } from "@/components/progress-bar";
import { ResultGallery, type CreationResult } from "@/components/result-gallery";

const templates = [
  "Write a professional email to a client about project delays",
  "Create a catchy Instagram caption for a coffee shop",
  "Generate a blog post outline about AI in healthcare",
  "Draft a product description for wireless headphones",
];

const mockOutputs: Record<string, string> = {
  email: "Subject: Project Timeline Update\n\nDear valued client,\n\nI hope this message finds you well. I wanted to reach out regarding the current status of our ongoing project...",
  social: "☕ Rise and grind! There's nothing quite like that first sip of artisan coffee on a Monday morning. What's your go-to order? #CoffeeLovers #MondayMotivation",
  blog: "1. Introduction to AI in Healthcare\n2. Current Applications & Case Studies\n3. Benefits for Patients and Providers\n4. Ethical Considerations\n5. Future Trends and Predictions\n6. Conclusion",
  product: "Experience immersive sound with our premium wireless headphones. Featuring active noise cancellation, 30-hour battery life, and crystal-clear audio for music, calls, and everything in between.",
};

export default function GenerateTextPage() {
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<CreationResult[]>([]);

  function handleSubmit(prompt: string) {
    setGenerating(true);
    // ProgressBar will call onComplete when it hits 100%
  }

  function handleComplete() {
    setGenerating(false);
    const keys = Object.keys(mockOutputs);
    const key = keys[Math.floor(Math.random() * keys.length)];
    const newResult: CreationResult = {
      id: Math.random().toString(36).slice(2),
      type: "text",
      title: promptSlice(results.length),
      content: mockOutputs[key],
      createdAt: "Just now",
    };
    setResults((prev) => [newResult, ...prev]);
  }

  function promptSlice(index: number) {
    const titles = ["Generated Copy", "AI Draft", "Text Output", "Creative Write"];
    return titles[index % titles.length];
  }

  function handleDelete(id: string) {
    setResults((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Text Generator</h1>
        <p className="text-gray-500">Generate blog posts, emails, social copy, and more.</p>
      </div>

      <PromptInput
        templates={templates}
        onSubmit={handleSubmit}
        disabled={generating}
      />

      <GenerationProgress isGenerating={generating} onComplete={handleComplete} />

      {results.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Results</h2>
          <ResultGallery results={results} onDelete={handleDelete} />
        </div>
      )}
    </div>
  );
}
