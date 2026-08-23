import { createFileRoute, Link } from "@tanstack/react-router";
import { SareeCard } from "@/components/saree-card";
import { sarees, weaves } from "@/data/sarees";
import { useShopStore } from "@/lib/shop-store";

type ShopSearch = { weave?: string | undefined };

export const Route = createFileRoute("/shop/")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    weave: typeof search["weave"] === "string" ? search["weave"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop Handwoven Sarees | Kadha" },
      {
        name: "description",
        content:
          "Browse the full Kadha collection of handwoven sarees — Kanjivaram, Banarasi, Chanderi, tussar, linen and cotton, with clear prices.",
      },
      { property: "og:title", content: "Shop Handwoven Sarees | Kadha" },
      {
        property: "og:description",
        content: "The full Kadha collection of handwoven sarees, with clear prices.",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Shop Handwoven Sarees | Kadha",
          url: "https://www.kadha.shop/shop",
          description:
            "The full Kadha collection of handwoven sarees — Kanjivaram, Chettinad, ikat and cotton.",
          mainEntity: {
            "@type": "ItemList",
            itemListElement: sarees.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://www.kadha.shop/shop/${s.slug}`,
              name: s.name,
            })),
          },
        }),
      },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { weave } = Route.useSearch();
  const { products } = useShopStore();
  const activeProducts = products || [];

  const activeWeaves = Array.from(
    new Set(activeProducts.map((p) => p.weave?.trim()).filter(Boolean) as string[])
  );

  const list = weave ? activeProducts.filter((s) => s.weave === weave) : activeProducts;

  const pill =
    "rounded-full px-5 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors border font-semibold";

  return (
    <div className="pb-8">
      <div className="bg-brand-soft py-16 text-primary-foreground">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">The collection</p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl">Sarees on the loom now</h1>
          <div className="ornament-rule mx-auto mt-5 w-40" />
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-primary-foreground/75">
            A small selection, refreshed as looms finish. Every piece is one of a kind.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
        {activeWeaves.length > 0 && (
          <>
            <h2 className="mt-12 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">
              Browse by weave category
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/shop"
                resetScroll={false}
                className={`${pill} ${
                  weave
                    ? "border-border text-muted-foreground hover:border-gold hover:text-brand"
                    : "border-brand bg-brand text-primary-foreground"
                }`}
              >
                All ({products.length})
              </Link>
              {activeWeaves.map((w) => (
                <Link
                  key={w}
                  to="/shop"
                  search={{ weave: w }}
                  resetScroll={false}
                  className={`${pill} ${
                    w === weave
                      ? "border-brand bg-brand text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-gold hover:text-brand"
                  }`}
                >
                  {w}
                </Link>
              ))}
            </div>
          </>
        )}

        <h2 className="mt-14 text-center font-display text-2xl text-brand-soft">
          {weave ? `${weave} sarees` : "Every saree in the collection"}
        </h2>
        {list.length > 0 ? (
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((saree) => (
              <SareeCard key={saree.slug} saree={saree} />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <p className="font-display text-xl font-semibold text-brand-soft">
              {weave ? `No ${weave} sarees available right now` : "New Collection Launching Soon ✨"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {weave ? "Try selecting 'All' or browse another weave category." : "Our weavers are crafting new handloom sarees. Check back shortly!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}