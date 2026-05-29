import Link from "next/link";

const CIRCLES = [
  { w: 40, h: 40, l: "5%", t: "10%" },
  { w: 20, h: 20, l: "20%", t: "70%" },
  { w: 30, h: 30, l: "40%", t: "20%" },
  { w: 50, h: 50, l: "60%", t: "60%" },
  { w: 15, h: 15, l: "80%", t: "30%" },
  { w: 35, h: 35, l: "90%", t: "80%" },
  { w: 25, h: 25, l: "10%", t: "50%" },
  { w: 45, h: 45, l: "50%", t: "85%" },
];

export function CTAStrip() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-pink to-brand-purple p-16 text-center">
          {/* Decorative circles */}
          {CIRCLES.map((c, i) => (
            <div
              key={i}
              className="pointer-events-none absolute rounded-full bg-white opacity-10"
              style={{
                width: c.w,
                height: c.h,
                left: c.l,
                top: c.t,
              }}
            />
          ))}

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            <h2 className="text-4xl font-bold text-white md:text-5xl">Ready to create?</h2>
            <p className="max-w-md text-lg text-white/80">
              Join the teams building creative campaigns with AI.
            </p>
            <Link
              href="/dashboard"
              className="rounded-xl bg-white px-8 py-3 text-base font-semibold text-brand-pink shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
            >
              Start Creating Free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
