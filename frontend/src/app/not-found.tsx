import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-screen bg-[var(--background)]">
      <p className="text-8xl font-bold text-brand-pink">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Page not found</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 px-5 py-2.5 rounded-lg bg-brand-pink text-white text-sm font-medium hover:bg-brand-pink/90 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
