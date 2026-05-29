"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface ProgressBarProps {
  isGenerating: boolean;
  onComplete?: () => void;
}

export function GenerationProgress({ isGenerating, onComplete }: ProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const statuses = [
    "Initializing model...",
    "Processing prompt...",
    "Generating content...",
    "Refining output...",
    "Finalizing...",
  ];

  useEffect(() => {
    if (!isGenerating) {
      setProgress(0);
      setStatus("");
      return;
    }

    setProgress(0);
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 15;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        onComplete?.();
      }
      setProgress(current);
      setStatus(statuses[Math.min(Math.floor((current / 100) * statuses.length), statuses.length - 1)]);
    }, 400);

    return () => clearInterval(interval);
  }, [isGenerating]);

  if (!isGenerating && progress === 0) return null;

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
        <Loader2 className="h-4 w-4 animate-spin text-create-600" />
        {status || "Generating..."}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-create-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-1 text-right text-xs text-gray-500">{Math.round(progress)}%</div>
    </div>
  );
}
