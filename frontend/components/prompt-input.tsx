"use client";

import { useState } from "react";
import { Send, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptInputProps {
  templates?: string[];
  placeholder?: string;
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
}

export function PromptInput({
  templates = [],
  placeholder = "Describe what you want to create...",
  onSubmit,
  disabled,
}: PromptInputProps) {
  const [value, setValue] = useState("");

  return (
    <div className="space-y-3">
      {templates.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {templates.map((t) => (
            <button
              key={t}
              onClick={() => setValue(t)}
              className="rounded-full bg-create-50 px-3 py-1 text-xs font-medium text-create-700 hover:bg-create-100"
            >
              {t}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <textarea
          rows={3}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "flex-1 resize-none rounded-xl border p-3 text-sm focus:border-create-500 focus:outline-none focus:ring-1 focus:ring-create-500",
            disabled && "opacity-50"
          )}
        />
        <button
          onClick={() => {
            if (!value.trim()) return;
            onSubmit(value);
          }}
          disabled={disabled || !value.trim()}
          className="flex flex-col items-center justify-center gap-1 rounded-xl bg-create-600 px-5 text-white transition-colors hover:bg-create-700 disabled:opacity-50"
        >
          <Wand2 className="h-5 w-5" />
          <span className="text-xs font-medium">Generate</span>
        </button>
      </div>
    </div>
  );
}
