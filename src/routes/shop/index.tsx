import { createFileRoute } from "@tanstack/react-router";
import { FreshProductSection } from "@/components/fresh-product-section";
import { sarees } from "@/data/sarees";

export const Route = createFileRoute("/shop/")({
  head: () => ({
    meta: [
      { title: "Saree Catalog | Kadha Sarees" },
      {
        name: "description",
        content:
          "Browse our curated collection of handwoven sarees — Kanjivaram, Banarasi, Mulmul, Chanderi & Sungudi cotton.",
      },
      { property: "og:title", content: "Saree Catalog | Kadha Sarees" },
      {
        property: "og:description",
        content: "Explore authentic handloom drapes woven directly by artisan families.",
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
  component: ShopCatalog,
});

function ShopCatalog() {
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Catalog Hero Banner */}
      <div className="bg-cream py-14 border-b border-border">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
            Handloom Artisan Collection
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-brand-soft sm:text-5xl">
            The Saree Catalog
          </h1>
          <p className="mt-3 max-w-xl mx-auto text-sm text-muted-foreground leading-relaxed">
            Every saree is crafted in limited batches by weaver families in Kanchipuram, Banaras, and Tamil Nadu. Tested purity and insured shipping across India.
          </p>
        </div>
      </div>

      {/* Fresh Product Section */}
      <FreshProductSection />
    </div>
  );
}
