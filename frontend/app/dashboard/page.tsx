"use client";

import Link from "next/link";
import { Type, Image, Mic, Video, Plus } from "lucide-react";

const quickStart = [
  { label: "Blog Post", href: "/generate/text", icon: Type, color: "bg-blue-50 text-blue-600" },
  { label: "Social Media", href: "/generate/text", icon: Type, color: "bg-sky-50 text-sky-600" },
  { label: "Image", href: "/generate/image", icon: Image, color: "bg-purple-50 text-purple-600" },
  { label: "Audio", href: "/generate/audio", icon: Mic, color: "bg-amber-50 text-amber-600" },
  { label: "Video", href: "/generate/video", icon: Video, color: "bg-rose-50 text-rose-600" },
];

const recentCreations = [
  { id: "1", title: "Summer campaign copy", type: "text", date: "2 min ago" },
  { id: "2", title: "Product hero image", type: "image", date: "1 hour ago" },
  { id: "3", title: "Podcast intro voice", type: "audio", date: "3 hours ago" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! What will you create today?</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {quickStart.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-2 rounded-xl border bg-white p-4 transition-shadow hover:shadow-sm"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-gray-700">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm text-gray-500">Total Creations</div>
          <div className="text-3xl font-bold text-gray-900">128</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm text-gray-500">This Week</div>
          <div className="text-3xl font-bold text-create-600">24</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm text-gray-500">Favorites</div>
          <div className="text-3xl font-bold text-gray-900">12</div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Creations</h2>
        <div className="space-y-3">
          {recentCreations.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border bg-white p-4"
            >
              <div>
                <div className="font-medium text-gray-900">{c.title}</div>
                <div className="text-xs text-gray-500 capitalize">{c.type} • {c.date}</div>
              </div>
              <Link
                href={`/generate/${c.type}`}
                className="rounded-lg bg-create-50 px-3 py-1.5 text-xs font-medium text-create-700 hover:bg-create-100"
              >
                Open
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
