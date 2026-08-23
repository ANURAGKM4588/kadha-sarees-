import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { sarees, getSaree, type Saree } from "@/data/sarees";
import { useShopStore } from "@/lib/shop-store";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Check,
  ChevronLeft,
  Share2,
} from "lucide-react";

export const Route = createFileRoute("/shop/$slug")({
  loader: ({ params }) => {
    const saree = getSaree(params.slug);
    if (!saree) {
      throw notFound();
    }
    return saree;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name || "Saree"} | Kadha Sarees` },
      {
        name: "description",
        content:
          loaderData?.blurb ||
          "Handwoven saree from Kadha. Tested purity, real zari, weaver named on every label.",
      },
    ],
  }),
  component: SareeDetailPage,
});

function SareeDetailPage() {
  const sareeFromLoader = Route.useLoaderData();
  const { products } = useShopStore();
  const { addItem } = useCart();

  const saree: Saree = useMemo(() => {
    if (!products || products.length === 0) return sareeFromLoader;
    const match = products.find((p) => p.slug === sareeFromLoader.slug);
    return match || sareeFromLoader;
  }, [products, sareeFromLoader]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [blouseOption, setBlouseOption] = useState<"with" | "without">("with");
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const images = useMemo(() => {
    if (saree.views && saree.views.length > 0) {
      return saree.views;
    }
    return [{ url: saree.image, label: "Full drape" }];
  }, [saree]);

  const hasDiscount = saree.originalPrice && saree.originalPrice > saree.price;
  const discountPercent = hasDiscount
    ? Math.round(((saree.originalPrice! - saree.price) / saree.originalPrice!) * 100)
    : 0;

  const currentPrice =
    blouseOption === "without" && saree.withoutBlouseDiscount
      ? saree.price - saree.withoutBlouseDiscount
      : saree.price;

  const handleAddToCart = () => {
    addItem(saree, 1, blouseOption);
    setAddedToast(`Added "${saree.name}" to your bag!`);
    setTimeout(() => setAddedToast(null), 3500);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <Check className="h-4 w-4 text-gold shrink-0" />
          <span>{addedToast}</span>
          <Link
            to="/bag"
            className="ml-2 underline text-gold hover:text-gold-soft text-xs uppercase tracking-wider"
          >
            View Bag
          </Link>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1400px] px-5 py-6 lg:px-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Catalog
        </Link>
      </div>

      {/* Product Detail Container */}
      <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Gallery View */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-cream shadow-md">
              <img
                src={images[activeImageIndex]?.url || saree.image}
                alt={saree.name}
                className="h-full w-full object-cover object-top transition-all duration-500"
              />
              {hasDiscount && (
                <div className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                  -{discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Selector */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      activeImageIndex === idx ? "border-brand shadow-md scale-105" : "border-border/60 opacity-70"
                    }`}
                  >
                    <img src={img.url} alt={img.label} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details & Purchasing Options */}
          <div className="flex flex-col">
            <div className="inline-flex items-center gap-2 w-fit rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-brand">
              <Sparkles className="h-3.5 w-3.5 text-gold" /> {saree.weave}
            </div>

            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-brand-soft sm:text-4xl">
              {saree.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-display text-3xl font-bold text-brand-soft">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(saree.originalPrice!)}
                </span>
              )}
              <span className="text-xs text-muted-foreground ml-2">Inclusive of all taxes</span>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              {saree.blurb}
            </p>

            {/* Blouse Preference Selector */}
            {saree.withoutBlouseDiscount && (
              <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-soft">
                  Blouse Preference
                </label>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setBlouseOption("with")}
                    className={`rounded-xl p-3 text-left text-xs font-medium transition-all ${
                      blouseOption === "with"
                        ? "border-2 border-brand bg-brand/5 text-brand shadow-sm"
                        : "border border-border bg-background text-muted-foreground"
                    }`}
                  >
                    <p className="font-semibold text-foreground">With Blouse Piece</p>
                    <p className="mt-0.5 text-[11px] opacity-80">Unstitched running fabric</p>
                  </button>
                  <button
                    onClick={() => setBlouseOption("without")}
                    className={`rounded-xl p-3 text-left text-xs font-medium transition-all ${
                      blouseOption === "without"
                        ? "border-2 border-brand bg-brand/5 text-brand shadow-sm"
                        : "border border-border bg-background text-muted-foreground"
                    }`}
                  >
                    <p className="font-semibold text-foreground">Without Blouse</p>
                    <p className="mt-0.5 text-[11px] text-green-700 font-semibold">Save ₹{saree.withoutBlouseDiscount}</p>
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 rounded-full bg-brand py-4 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-all hover:bg-brand-soft shadow-lg"
              >
                <ShoppingBag className="h-4 w-4" /> Add to Bag
              </button>
              <Link
                to="/booking"
                className="flex items-center justify-center rounded-full bg-ink py-4 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-transform hover:scale-[1.02] shadow-lg text-center"
              >
                Book Drape Directly
              </Link>
            </div>

            {/* Specifications Card */}
            <div className="mt-10 rounded-2xl border border-border bg-card p-6 space-y-3 text-xs text-muted-foreground">
              <h3 className="font-display text-sm font-semibold text-brand-soft border-b border-border pb-2">
                Drape Details & Care
              </h3>
              <div className="flex justify-between">
                <span className="font-medium text-foreground">Weave Type</span>
                <span>{saree.weave}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-foreground">Colour</span>
                <span>{saree.colour}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-foreground">Fabric</span>
                <span>{saree.fabric}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-foreground">Blouse</span>
                <span>{saree.blouse}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-foreground">Care</span>
                <span>{saree.care}</span>
              </div>
            </div>

            {/* Guarantees */}
            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-border pt-6 text-center text-xs text-muted-foreground">
              <div className="flex flex-col items-center gap-1.5">
                <ShieldCheck className="h-5 w-5 text-gold" />
                <span className="font-medium text-foreground">100% Handloom</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Truck className="h-5 w-5 text-gold" />
                <span className="font-medium text-foreground">Insured Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <RotateCcw className="h-5 w-5 text-gold" />
                <span className="font-medium text-foreground">7-Day Exchange</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
