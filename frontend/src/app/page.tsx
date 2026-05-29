import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeatureCarousel } from "@/components/landing/feature-carousel";
import { CopilotDemo } from "@/components/landing/copilot-demo";
import { CTAStrip } from "@/components/landing/cta-strip";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />
      <HeroSection />
      <FeatureCarousel />
      <CopilotDemo />
      <CTAStrip />
    </div>
  );
}
