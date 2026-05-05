"use client";

import { APP_NAME, APP_TAGLINE } from "@/lib/tokens";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">API Keys</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              OpenAI API Key
            </label>
            <input
              type="password"
              placeholder="sk-..."
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-create-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Stability AI Key
            </label>
            <input
              type="password"
              placeholder="sk-..."
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-create-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Model Selection</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Default Text Model
            </label>
            <select className="w-full rounded-lg border px-3 py-2 text-sm focus:border-create-500 focus:outline-none">
              <option>GPT-4o</option>
              <option>Claude 3.5 Sonnet</option>
              <option>Gemini Pro</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Default Image Model
            </label>
            <select className="w-full rounded-lg border px-3 py-2 text-sm focus:border-create-500 focus:outline-none">
              <option>DALL·E 3</option>
              <option>Stable Diffusion XL</option>
              <option>Midjourney</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Appearance</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Dark mode</span>
          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
            <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-white transition-transform" />
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">About</h2>
        <div className="text-sm text-gray-600">
          <p className="mb-2">
            <strong>{APP_NAME}</strong>
          </p>
          <p className="mb-2">{APP_TAGLINE}</p>
          <p>
            Version <span className="font-medium">0.1.0</span>
          </p>
        </div>
      </div>
    </div>
  );
}
