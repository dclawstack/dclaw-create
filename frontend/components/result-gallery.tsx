"use client";

import { Download, Share2, Trash2 } from "lucide-react";

export interface CreationResult {
  id: string;
  type: "text" | "image" | "audio" | "video";
  title: string;
  content?: string;
  createdAt: string;
}

interface ResultGalleryProps {
  results: CreationResult[];
  onDelete?: (id: string) => void;
}

export function ResultGallery({ results, onDelete }: ResultGalleryProps) {
  if (results.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {results.map((item) => (
        <div
          key={item.id}
          className="group relative rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-create-600">
              {item.type}
            </span>
            <span className="text-xs text-gray-400">{item.createdAt}</span>
          </div>
          <div className="mb-3 text-sm font-medium text-gray-900">{item.title}</div>
          {item.content && (
            <div className="mb-3 max-h-32 overflow-y-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
              {item.content}
            </div>
          )}
          {!item.content && item.type === "image" && (
            <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-create-100 to-create-200 text-create-600">
              <span className="text-sm font-medium">Generated Image</span>
            </div>
          )}
          {!item.content && item.type === "audio" && (
            <div className="mb-3 flex h-16 items-center justify-center rounded-lg bg-gray-100">
              <div className="flex items-center gap-1">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-create-500"
                    style={{ height: `${Math.random() * 24 + 4}px` }}
                  />
                ))}
              </div>
            </div>
          )}
          {!item.content && item.type === "video" && (
            <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-gray-900 text-white">
              <span className="text-sm font-medium">Video Preview</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button className="flex flex-1 items-center justify-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
            <button className="flex flex-1 items-center justify-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(item.id)}
                className="rounded-lg border px-3 py-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
