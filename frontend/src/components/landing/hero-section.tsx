"use client";

import Link from "next/link";

const FLOATING_ELEMENTS = [
  { label: "Image ✦", x: "8%", y: "20%", delay: "0s" },
  { label: "Video ▶", x: "78%", y: "15%", delay: "1.2s" },
  { label: "Audio ♪", x: "82%", y: "55%", delay: "0.6s" },
  { label: "Brand 🎨", x: "5%", y: "65%", delay: "1.8s" },
  { label: "Template ⊡", x: "72%", y: "75%", delay: "0.3s" },
  { label: "Copy ✍", x: "15%", y: "78%", delay: "2.1s" },
];

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
      {/* Radial glow background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(236,72,153,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Floating elements */}
      {FLOATING_ELEMENTS.map((el) => (
        <div
          key={el.label}
          className="absolute rounded-xl border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-[var(--foreground)]"
          style={{
            left: el.x,
            top: el.y,
            animationDelay: el.delay,
            animation: "float 6s ease-in-out infinite",
          }}
        >
          {el.label}
        </div>
      ))}

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-pink/40 bg-brand-pink/10 px-4 py-1.5 text-sm font-medium text-brand-pink">
          ✦ AI-Powered Creative Studio
        </div>

        {/* Headline */}
        <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
          <span className="text-[var(--foreground)]">Generate anything.</span>
          <br />
          <span
            className="bg-gradient-to-r from-brand-pink to-brand-purple bg-clip-text text-transparent"
          >
            Text, images, audio, video
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-xl text-lg text-[var(--muted-foreground)]">
          The AI-powered creative studio for teams that move fast. No design skills required.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-xl bg-brand-pink px-6 py-3 text-base font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
          >
            Start Creating →
          </Link>
          <Link
            href="/templates"
            className="rounded-xl border border-[var(--border)] bg-[var(--card)]/60 px-6 py-3 text-base font-semibold text-[var(--foreground)] backdrop-blur-sm transition-colors hover:bg-[var(--muted)]"
          >
            Browse Templates
          </Link>
        </div>
      </div>
    </section>
  );
}
