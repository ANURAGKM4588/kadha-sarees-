import { createFileRoute, Link } from "@tanstack/react-router";
import weaver from "@/assets/weaver.jpg";
import { Heart, ShieldCheck, Sparkles, Award } from "lucide-react";
import { getPublicUrl } from "@/lib/utils";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story & Journey | Kadha Studio" },
      {
        name: "description",
        content:
          "Kadha was born out of a shared passion between two close friends. Handpicked sarees, verified weavers, and rigorous quality checks.",
      },
      { property: "og:title", content: "Our Journey & Story | Kadha Studio" },
      {
        property: "og:description",
        content: "Curated with Love, Checked with Care. Discover the story behind Kadha sarees.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-12 py-12 sm:py-16 font-sans text-slate-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
        
        {/* LEFT SIDE: Sticky Full Image Frame */}
        <div className="lg:col-span-5 relative">
          <div className="lg:sticky lg:top-24 h-full min-h-[400px] lg:min-h-[680px] rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100">
            <img
              src={getPublicUrl("logo/About us.png")}
              alt="Kadha Studio About Us"
              width={1408}
              height={912}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </div>

        {/* RIGHT SIDE: Story & Quality Content Flow */}
        <div className="lg:col-span-7 space-y-12 py-2">
          
          {/* Header & Story Narrative */}
          <div className="space-y-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold block">
              About Kadha Studio
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-slate-900 leading-[1.1] font-semibold">
              Kadha means story. <br />
              <span className="text-gold italic font-normal">Ours is told in thread.</span>
            </h1>
            <div className="h-0.5 w-16 bg-gold/60" />

            <div className="space-y-5 text-base sm:text-lg leading-relaxed text-slate-600 font-normal">
              <p>
                Kadha was born out of a shared passion and an unbreakable bond between two close friends. We always believed that the beauty of Indian tradition lies in its authenticity. Growing up, we watched the women around us drape stories of grace, strength, and joy through their sarees.
              </p>
              <p className="text-slate-900 font-medium italic text-lg sm:text-xl border-l-2 border-gold pl-5 py-2.5 bg-amber-50/50 rounded-r-xl">
                "We wanted to create something meaningful together—a place where tradition meets uncompromised quality. That shared dream became Kadha."
              </p>
            </div>
          </div>

          {/* Quality Promise Section */}
          <div className="space-y-6 border-t border-slate-200/80 pt-10">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900">
                Curated with Love, Checked with Care
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 italic">
                "We don’t just sell sarees; we handpick them as if we were choosing them for our own family."
              </p>
            </div>

            {/* 3 Quality Cards List */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-gold/40 transition-colors shadow-2xs">
                <div className="h-11 w-11 shrink-0 rounded-xl bg-gold/15 flex items-center justify-center text-gold">
                  <Award className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-base font-semibold text-slate-900">
                    The Best Weavers & Craftsmen
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    We partner closely with skilled and verified manufacturers who have perfected the art of weaving over generations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-gold/40 transition-colors shadow-2xs">
                <div className="h-11 w-11 shrink-0 rounded-xl bg-gold/15 flex items-center justify-center text-gold">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-base font-semibold text-slate-900">
                    Rigorous Quality Checks
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Every single saree goes through our personal hands. We touch the fabric, check the borders, inspect the weave, and ensure that only the most flawless pieces make it to your wardrobe.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-gold/40 transition-colors shadow-2xs">
                <div className="h-11 w-11 shrink-0 rounded-xl bg-gold/15 flex items-center justify-center text-gold">
                  <Heart className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-base font-semibold text-slate-900">
                    Timeless Elegance
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    From festive celebrations to quiet moments of elegance, our collection is curated to make you feel beautiful, confident, and rooted.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* You Are Part of Our Kadha Section & CTA */}
          <div className="rounded-3xl border border-slate-200 bg-slate-900 text-white p-8 sm:p-10 space-y-5 shadow-xl">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white">
              You are Part of Our Kadha
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              When you wear a Kadha saree, you aren't just wearing an outfit—you are carrying forward centuries of craftsmanship and becoming a part of our dream.
            </p>
            <p className="text-xs sm:text-sm font-medium text-gold italic">
              Thank you for letting us be a small part of your special memories and everyday celebrations.
            </p>
            <div className="pt-2">
              <Link
                to="/booking"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-950 transition-all hover:bg-gold-soft hover:scale-105 shadow-md cursor-pointer"
              >
                Book Your Drape
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}