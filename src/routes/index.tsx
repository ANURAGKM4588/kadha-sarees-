import { createFileRoute, Link } from "@tanstack/react-router";
import { HeroSectionOption4 } from "@/components/hero-section-option4";
import { FreshProductSection } from "@/components/fresh-product-section";
import weaver from "@/assets/weaver.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kadha Sarees" },
      {
        name: "description",
        content:
          "Kadha offers a small, considered collection of handwoven Kanjivaram, Banarasi, Chanderi and linen sarees. Simple to browse, simple to book.",
      },
      { property: "og:title", content: "Kadha Sarees" },
      {
        property: "og:description",
        content: "A small, considered collection of handwoven sarees. The story begins here.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="pb-4 bg-[#fdfbf7]">
      <HeroSectionOption4 />

      {/* Marquee */}
      <section className="mt-14 overflow-hidden bg-cream py-4 border-y border-gold/40 shadow-2xs">
        <div className="marquee-track flex w-max gap-10 whitespace-nowrap text-sm text-brand-soft font-semibold tracking-wide">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex gap-10">
              {[
                "Real zari",
                "Weaver named on every label",
                "Insured shipping",
                "Made to order",
                "7-day exchange",
                "Handloom mark certified",
              ].map((item) => (
                <span key={item} className="flex items-center gap-10">
                  {item}
                  <span className="text-gold">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </section>

      {/* Fresh Product Section */}
      <FreshProductSection />

      {/* Story */}
      <section className="mt-20 bg-cream/70 py-20 border-y border-border/60">
        <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <div className="relative">
            <img
              src={weaver}
              alt="A weaver working green silk thread on a wooden handloom"
              width={1408}
              height={912}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-lg border border-gold/20"
            />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand">
              The house of Kadha
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.05] tracking-[-0.02em] text-brand-soft sm:text-[2.75rem]">
              Every saree carries the name of{" "}
              <span className="font-serif font-normal italic text-gold">the hands that made it</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              Kadha works with six family workshops across Kanchipuram, Banaras and Chanderi. We
              take a handful of pieces each month, pay the weaver before the saree sells, and send
              you the loom story with your order.
            </p>
            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              {[
                { k: "Real zari", v: "Tested purity" },
                { k: "Small batch", v: "Never mass-made" },
                { k: "Fair pay", v: "Paid upfront" },
              ].map((item) => (
                <div key={item.k} className="rounded-2xl bg-card border border-border p-5 shadow-xs">
                  <p className="font-display text-base font-medium text-brand-soft">{item.k}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.v}</p>
                </div>
              ))}
            </div>
            <Link
              to="/about"
              className="mt-9 inline-block rounded-full bg-brand px-8 py-4 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] shadow-md"
            >
              Read our story
            </Link>
          </div>
        </div>
      </section>

      {/* How booking works */}
      <section className="mx-auto max-w-[1400px] px-5 pt-20 lg:px-8">
        <h2 className="max-w-lg font-display text-3xl font-semibold tracking-[-0.02em] text-brand-soft sm:text-4xl">
          Booking a saree takes three steps
        </h2>
        <div className="mt-9 grid gap-px overflow-hidden rounded-[2rem] bg-border sm:grid-cols-3">
          {[
            { n: "01", t: "Pick your drape", d: "Browse the month's pieces and add to your bag." },
            { n: "02", t: "Share the occasion", d: "One short form — date, city, blouse notes." },
            { n: "03", t: "We reserve it", d: "Confirmation within a day, insured door delivery." },
          ].map((s) => (
            <div key={s.n} className="bg-card p-8">
              <span className="font-display text-sm font-medium text-gold">{s.n}</span>
              <p className="mt-4 font-display text-xl font-medium tracking-tight text-brand-soft">
                {s.t}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Voices */}
      <section className="mx-auto max-w-[1400px] px-5 pt-20 lg:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand">In their words</p>
        <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold tracking-[-0.02em] text-brand-soft sm:text-4xl">
          Worn at weddings, kept for daughters
        </h2>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {[
            {
              q: "The zari is the real thing. My mother noticed before I said a word.",
              n: "Meera S., Chennai",
            },
            {
              q: "Booking took two minutes and the saree arrived wrapped in muslin.",
              n: "Ananya R., Pune",
            },
            {
              q: "Light enough to wear all day at work, grand enough for a reception.",
              n: "Divya K., Bengaluru",
            },
          ].map((t) => (
            <figure
              key={t.n}
              className="rounded-[2rem] bg-card border border-border/80 p-8 shadow-xs transition-colors hover:bg-cream"
            >
              <p className="font-serif text-2xl leading-snug text-brand-soft">“{t.q}”</p>
              <figcaption className="mt-6 text-xs text-muted-foreground">{t.n}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Booking CTA */}
      <section className="mx-auto mt-20 max-w-[1400px] px-5 lg:px-8">
        <div className="grid items-center gap-8 overflow-hidden rounded-[2.5rem] bg-cream border-2 border-gold/40 px-8 py-14 text-brand-soft shadow-xl sm:px-12 lg:grid-cols-[1.2fr_auto]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
              Two-minute booking
            </p>
            <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-[2.75rem]">
              Tell us the occasion, we'll{" "}
              <span className="font-serif font-normal italic text-brand">reserve the drape</span>
            </h2>
          </div>
          <Link
            to="/booking"
            className="w-fit rounded-full bg-brand px-9 py-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-transform hover:scale-[1.03] shadow-md"
          >
            Book a saree →
          </Link>
        </div>
      </section>
    </div>
  );
}
