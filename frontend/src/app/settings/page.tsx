"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface SettingsLink {
  href: string;
  title: string;
  description: string;
}

const links: SettingsLink[] = [
  {
    href: "/settings/ai-providers",
    title: "AI Providers",
    description:
      "Configure LLM providers, API keys, and default models for content generation.",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Manage your application configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="group block">
            <Card className="transition-colors hover:border-[#EC4899]/50 h-full">
              <CardContent className="p-6">
                <h2 className="font-semibold text-[var(--foreground)] group-hover:text-[#EC4899] transition-colors">
                  {link.title}
                </h2>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  {link.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
