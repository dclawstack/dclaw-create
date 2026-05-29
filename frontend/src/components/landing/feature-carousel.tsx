"use client";

const FEATURES = [
  {
    icon: "✦",
    title: "AI Creative Copilot",
    desc: "Generate creative assets from natural language. Images in <10s, videos in <60s.",
  },
  {
    icon: "📚",
    title: "Asset Library",
    desc: "Organize with AI auto-tagging. Search by color, object, or text across all your content.",
  },
  {
    icon: "📐",
    title: "Template Gallery",
    desc: "100+ templates for every platform. Auto-resize for Instagram, YouTube, LinkedIn and more.",
  },
  {
    icon: "🎨",
    title: "Brand Kit",
    desc: "Define your brand once. AI enforces consistency and detects violations before they ship.",
  },
  {
    icon: "⚡",
    title: "Multi-Provider AI",
    desc: "Connect OpenRouter, Ollama, or OpenAI. Switch providers without changing your workflow.",
  },
];

const DOUBLED = [...FEATURES, ...FEATURES];

export function FeatureCarousel() {
  return (
    <section id="features" className="py-24">
      <style>{`
        @keyframes dclaw-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .dclaw-scroll-track {
          animation: dclaw-scroll 30s linear infinite;
        }
        .dclaw-scroll-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Section headline */}
      <div className="mb-16 px-6 text-center">
        <h2 className="text-3xl font-bold text-[var(--foreground)] md:text-4xl">
          Everything a creative team needs,{" "}
          <span className="text-brand-pink">supercharged by AI.</span>
        </h2>
      </div>

      {/* Scrolling strip */}
      <div className="overflow-hidden">
        <div className="dclaw-scroll-track flex gap-6 w-max">
          {DOUBLED.map((feature, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-72 rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-sm p-6"
            >
              <div className="mb-4 h-10 w-10 rounded-xl bg-brand-pink/10 text-xl flex items-center justify-center text-brand-pink">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-base font-semibold text-[var(--foreground)]">
                {feature.title}
              </h3>
              <p className="text-sm text-[var(--muted-foreground)]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
