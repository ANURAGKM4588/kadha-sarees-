import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { QuantityStepper } from "@/components/quantity-stepper";
import { SareeCard } from "@/components/saree-card";
import { formatPrice, getSaree, sarees, type Saree, type SareeView } from "@/data/sarees";
import { useCart } from "@/lib/cart";
import { useShopStore } from "@/lib/shop-store";
import { triggerFlyToCartAnimation } from "@/lib/fly-to-cart";
import {
  Bell,
  Check,
  Sparkles,
  AlertCircle,
  Truck,
  MessageSquare,
  ShieldCheck,
  Droplets,
  Video,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/shop/$slug")({
  loader: ({ params }) => {
    const saree = getSaree(params.slug);
    if (saree) return saree;

    const title = params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      slug: params.slug,
      name: title,
      weave: "Handloom",
      colour: "Multi",
      price: 4999,
      image: "/logo/Favicon.png",
      views: [{ url: "/logo/Favicon.png", label: "Cover Page Image" }],
      blurb: "Handcrafted authentic handloom saree.",
      fabric: "Pure Handwoven Fabric",
      blouse: "Blouse piece included",
      care: "Dry clean recommended.",
      blouseAvailability: "both",
    } as Saree;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — ${loaderData.weave} Saree | Kadha` },
          { name: "description", content: loaderData.blurb },
          { property: "og:title", content: `${loaderData.name} | Kadha` },
          { property: "og:description", content: loaderData.blurb },
        ]
      : [],
    scripts: loaderData
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: loaderData.name,
              description: loaderData.blurb,
              image: loaderData.views.map((v: SareeView) => v.url),
              material: loaderData.fabric,
              brand: { "@type": "Brand", name: "Kadha" },
              offers: {
                "@type": "Offer",
                price: loaderData.price,
                priceCurrency: "INR",
                availability: "https://schema.org/InStock",
                url: `https://kadha.shop/shop/${loaderData.slug}`,
              },
            }),
          },
        ]
      : [],
  }),
  component: Product,
});

function Product() {
  const params = Route.useParams();
  const loadedSaree = Route.useLoaderData();
  const { add } = useCart();
  const { products, incrementCartAdds, createNotifyRequest } = useShopStore();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);

  const storedProduct = products.find((p) => p.slug === (loadedSaree?.slug || params.slug));
  const saree = storedProduct || loadedSaree;

  // Blouse Option State: "with" (default) or "without"
  const [selectedBlouseOption, setSelectedBlouseOption] = useState<"with" | "without">("with");

  // Notify Modal State
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyPhone, setNotifyPhone] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  const status = storedProduct?.status || "in_stock";
  const blouseAvailability = storedProduct?.blouseAvailability || saree.blouseAvailability || "both";
  const withoutBlouseDiscount = storedProduct?.withoutBlouseDiscount ?? saree.withoutBlouseDiscount ?? 0;

  const currentPrice =
    selectedBlouseOption === "without" && withoutBlouseDiscount > 0
      ? Math.max(1, saree.price - withoutBlouseDiscount)
      : saree.price;

  // Lock background page scroll when modal is open
  useEffect(() => {
    if (showNotifyModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showNotifyModal]);

  const mainImgRef = useRef<HTMLImageElement>(null);

  const gallery: SareeView[] =
    storedProduct?.views && storedProduct.views.length > 0 ? storedProduct.views : saree.views;
  const current: SareeView =
    gallery[Math.min(active, gallery.length - 1)] ?? { url: saree.image, label: "Full drape" };

  const related = products.filter((s) => s.slug !== saree.slug).slice(0, 3);

  const handleAddToCart = () => {
    triggerFlyToCartAnimation(mainImgRef.current);
    add(saree.slug, qty, selectedBlouseOption);
    incrementCartAdds(saree.slug, qty);
  };

  const handleBookNow = () => {
    triggerFlyToCartAnimation(mainImgRef.current);
    add(saree.slug, qty, selectedBlouseOption);
    incrementCartAdds(saree.slug, qty);
    navigate({ to: "/booking" });
  };


  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail) return;

    createNotifyRequest({
      sareeSlug: saree.slug,
      sareeName: saree.name,
      customerEmail: notifyEmail,
      ...(notifyPhone ? { customerPhone: notifyPhone } : {}),
      type: status === "coming_soon" ? "coming_soon" : "out_of_stock",
    });

    setNotifySubmitted(true);
    setTimeout(() => {
      setNotifySubmitted(false);
      setShowNotifyModal(false);
      setNotifyEmail("");
      setNotifyPhone("");
    }, 2500);
  };

  return (
    <div className="mx-auto max-w-[1536px] px-4 py-10 sm:px-6 lg:px-10">
      <Link
        to="/shop"
        className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-brand font-medium inline-block mb-2"
      >
        ← Collection
      </Link>

      {/* TOP SECTION: BALANCED 2-COLUMN MAIN PRODUCT OVERVIEW */}
      <div className="mt-4 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
        {/* LEFT COLUMN: PRODUCT IMAGE GALLERY */}
        <div className="flex flex-col gap-4 sm:flex-row-reverse sm:items-start">
          <div className="relative flex-1 aspect-[3/4] overflow-hidden rounded-3xl bg-secondary shadow-xs">
            <img
              ref={mainImgRef}
              key={current.url}
              src={current.url}
              alt={`${saree.name} — ${saree.weave} saree, ${current.label.toLowerCase()}`}
              width={912}
              height={1200}
              className="h-full w-full object-cover object-center"
            />
            {status === "in_stock" && (
              <span className="absolute left-5 top-5 rounded-full bg-background/90 px-4 py-1.5 text-[10px] uppercase tracking-[0.22em] text-brand-soft gold-frame font-medium">
                One of a kind
              </span>
            )}
            {status === "out_of_stock" && (
              <span className="absolute left-5 top-5 rounded-full bg-destructive/90 px-4 py-1.5 text-[10px] uppercase tracking-[0.22em] text-destructive-foreground font-semibold shadow-md">
                Out of Stock
              </span>
            )}
            {status === "coming_soon" && (
              <span className="absolute left-5 top-5 rounded-full bg-gold px-4 py-1.5 text-[10px] uppercase tracking-[0.22em] text-brand-soft font-semibold gold-frame shadow-md">
                Coming Soon
              </span>
            )}
            <span className="absolute bottom-5 left-5 rounded-full bg-background/85 px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {current.label}
            </span>
          </div>

          <div className="flex gap-3 sm:w-24 sm:flex-col">
            {gallery.map((view, i) => (
              <button
                key={view.url}
                type="button"
                onClick={() => setActive(i)}
                aria-label={view.label}
                aria-current={i === active}
                className={`overflow-hidden rounded-2xl border transition-all ${
                  i === active
                    ? "border-brand opacity-100 ring-2 ring-gold/40"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={view.url}
                  alt={`${saree.name} — ${view.label.toLowerCase()} thumbnail`}
                  width={96}
                  height={128}
                  loading="lazy"
                  className="h-24 w-20 object-cover sm:h-28 sm:w-full"
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: SAREE DETAILS, PRICING, SPECS, ACTIONS & HIGHLIGHTS */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-gold font-bold">{saree.weave}</p>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl leading-tight text-brand-soft">
              {status === "coming_soon" ? "Coming Soon" : saree.name}
            </h1>
            
            {blouseAvailability && blouseAvailability !== "none" && (
              <div className="mt-2.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 px-3 py-1 text-[11px] font-semibold text-amber-950 shadow-2xs">
                  {blouseAvailability === "with_only"
                    ? "✂️ With Attached Blouse Only"
                    : blouseAvailability === "without_only"
                    ? "🧵 Extra Blouse Piece Only"
                    : "✂️ Both Attached & Extra Blouse Options Available"}
                </span>
              </div>
            )}
            {status !== "coming_soon" && (
              (() => {
                const originalMrp =
                  saree.originalPrice && saree.originalPrice > currentPrice
                    ? saree.originalPrice
                    : Math.round(currentPrice * 1.25);
                const discountPercent = Math.round(((originalMrp - currentPrice) / originalMrp) * 100);
                return (
                  <div className="mt-4 flex flex-wrap items-baseline gap-2.5">
                    <p className="font-display text-3xl sm:text-4xl tabular-nums font-extrabold text-emerald-800">
                      {formatPrice(currentPrice)}
                    </p>
                    {originalMrp > currentPrice && (
                      <span className="text-base sm:text-lg text-slate-400 line-through font-sans tabular-nums font-normal">
                        {formatPrice(originalMrp)}
                      </span>
                    )}
                    {discountPercent > 0 && (
                      <span className="rounded-full bg-emerald-700 px-3 py-1 text-xs font-extrabold text-white shadow-xs">
                        {discountPercent}% OFF
                      </span>
                    )}
                    {selectedBlouseOption === "without" && withoutBlouseDiscount > 0 && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        ✂️ {formatPrice(withoutBlouseDiscount)} Discount Applied
                      </span>
                    )}
                  </div>
                );
              })()
            )}
            <p className="mt-1 text-[11px] text-muted-foreground">
              Inclusive of taxes · Free shipping inside Kerala
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {saree.blurb}
            </p>
          </div>

          {/* Specifications Table */}
          <dl className="space-y-3 rounded-2xl border border-border bg-card p-5 text-xs">
            <div className="flex gap-4">
              <dt className="w-20 shrink-0 text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                Fabric
              </dt>
              <dd className="font-medium text-foreground">{saree.fabric}</dd>
            </div>
            <div className="flex gap-4 border-t border-border/50 pt-2.5">
              <dt className="w-20 shrink-0 text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                Blouse
              </dt>
              <dd className="font-medium text-foreground">{saree.blouse}</dd>
            </div>
            <div className="flex gap-4 border-t border-border/50 pt-2.5">
              <dt className="w-20 shrink-0 text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                Care
              </dt>
              <dd className="font-medium text-foreground">{saree.care}</dd>
            </div>
          </dl>

          {/* Interactive Blouse Option Selection Card */}
          {blouseAvailability === "both" ? (
            <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold block mb-1">
                Select Blouse Option *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedBlouseOption("with")}
                  className={`flex flex-col items-start justify-between rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                    selectedBlouseOption === "with"
                      ? "border-brand bg-brand/5 ring-2 ring-gold/40"
                      : "border-border hover:border-border/80 bg-background"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5 whitespace-nowrap">
                      ✂️ With Attached Blouse
                    </span>
                    {selectedBlouseOption === "with" && (
                      <span className="h-2 w-2 rounded-full bg-brand"></span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    Matching attached blouse fabric included
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedBlouseOption("without")}
                  className={`flex flex-col items-start justify-between rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                    selectedBlouseOption === "without"
                      ? "border-brand bg-brand/5 ring-2 ring-gold/40"
                      : "border-border hover:border-border/80 bg-background"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5 whitespace-nowrap">
                      🧵 Extra Blouse Piece
                    </span>
                    {selectedBlouseOption === "without" && (
                      <span className="h-2 w-2 rounded-full bg-brand"></span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {withoutBlouseDiscount > 0
                      ? `Save ${formatPrice(withoutBlouseDiscount)} on saree`
                      : "Extra unstitched blouse piece"}
                  </span>
                </button>
              </div>
            </div>
          ) : blouseAvailability === "with_only" ? (
            <div className="rounded-2xl border border-border bg-card p-3.5 flex items-center gap-3">
              <span className="text-sm">✂️</span>
              <div>
                <p className="text-xs font-bold text-foreground">With Attached Blouse Only</p>
                <p className="text-[10px] text-muted-foreground">Matching attached blouse fabric included.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-3.5 flex items-center gap-3">
              <span className="text-sm">🧵</span>
              <div>
                <p className="text-xs font-bold text-foreground">Extra Blouse Piece</p>
                <p className="text-[10px] text-muted-foreground">Includes additional unstitched blouse piece.</p>
              </div>
            </div>
          )}



          {/* Action CTAs */}
          <div className="space-y-3">
            {status === "in_stock" ? (
              <>
                <div className="flex items-center gap-3">
                  <QuantityStepper value={qty} onChange={(n) => setQty(Math.max(1, n))} />
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 rounded-full border border-brand px-6 py-3.5 text-[11px] uppercase tracking-[0.2em] font-semibold text-brand transition-colors hover:bg-brand hover:text-primary-foreground cursor-pointer whitespace-nowrap"
                  >
                    Add to bag
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleBookNow}
                  className="w-full rounded-full bg-brand px-6 py-3.5 text-[11px] uppercase tracking-[0.2em] font-semibold text-primary-foreground transition-colors hover:bg-brand-soft cursor-pointer shadow-md whitespace-nowrap"
                >
                  Book now →
                </button>
              </>
            ) : status === "out_of_stock" ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-display text-lg font-medium text-foreground">
                  Currently Out of Stock
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  This handwoven masterpiece is currently off the loom. Leave your contact to get notified when restocked.
                </p>
                <button
                  type="button"
                  onClick={() => setShowNotifyModal(true)}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-destructive px-8 py-3 text-[11px] uppercase tracking-[0.22em] text-destructive-foreground transition-colors hover:bg-destructive/90 shadow-md cursor-pointer whitespace-nowrap"
                >
                  <Bell className="h-4 w-4" />
                  Notify Me When Restocked
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-gold/40 bg-gold/10 p-6 text-center gold-frame">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gold/20 text-brand-soft">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-display text-lg font-medium text-brand-soft">
                  On The Loom — Launching Soon
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Master artisans are currently weaving this creation. Register interest to reserve priority booking upon release.
                </p>
                <button
                  type="button"
                  onClick={() => setShowNotifyModal(true)}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-8 py-3 text-[11px] uppercase tracking-[0.22em] text-primary-foreground transition-colors hover:bg-brand-soft shadow-md cursor-pointer whitespace-nowrap"
                >
                  <Bell className="h-4 w-4 text-gold" />
                  Notify Me On Launch
                </button>
              </div>
            )}

            {/* Direct WhatsApp Order Link */}
            <a
              href={`https://wa.me/918156938843?text=${encodeURIComponent(`Hi Kadha Sarees, I would like to order "${saree.name}" (${formatPrice(saree.price)}).`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-500/10 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800 transition-colors hover:bg-emerald-500/20 shadow-2xs whitespace-nowrap"
            >
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              DM on WhatsApp to Order (+91 8156938843)
            </a>
          </div>

          {/* Highlights Badges */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
              <Truck className="mx-auto h-4 w-4 text-brand" />
              <p className="mt-1 font-display text-xs font-semibold text-brand-soft">Free Shipping</p>
              <p className="text-[10px] text-muted-foreground">Inside Kerala</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
              <Clock className="mx-auto h-4 w-4 text-gold" />
              <p className="mt-1 font-display text-xs font-semibold text-brand-soft">7 Working Days</p>
              <p className="text-[10px] text-muted-foreground">Kerala Delivery</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
              <Sparkles className="mx-auto h-4 w-4 text-amber-600" />
              <p className="mt-1 font-display text-xs font-semibold text-brand-soft">Limited Stock</p>
              <p className="text-[10px] text-muted-foreground">Book Yours Now</p>
            </div>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH DEDICATED POLICY & CARE SECTION (Fills whole screen width below overview with ZERO empty gaps) */}
      <section className="mt-14 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        <div className="border-b border-border pb-4 mb-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.24em] text-gold font-bold block mb-1">Customer Protection & Care</span>
            <h3 className="font-display text-xl font-bold uppercase tracking-[0.16em] text-brand-soft flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-gold shrink-0" /> Delivery, Damage Policy & Wash Care
            </h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full hidden sm:inline-block">
            Kadha Verified Policy
          </span>
        </div>

        {/* 3-COLUMN SIDE-BY-SIDE GRID CARDS (Fills entire screen width symmetrically) */}
        <div className="grid gap-6 md:grid-cols-3 items-stretch">
          {/* Card 1: Shipping & Delivery Timelines */}
          <div className="rounded-2xl border border-border/80 bg-background/60 p-5 space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="font-display text-xs font-bold text-brand-soft flex items-center gap-2 uppercase tracking-[0.14em] border-b border-border/50 pb-2.5 mb-3">
                <Truck className="h-4 w-4 text-brand shrink-0" /> Shipping & Delivery
              </h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong className="text-foreground font-semibold">Free Shipping:</strong> Complimentary insured delivery inside Kerala.</span>
                </p>
                <p className="flex items-start gap-2">
                  <Clock className="h-3.5 w-3.5 text-brand shrink-0 mt-0.5" />
                  <span><strong className="text-foreground font-semibold">Within Kerala:</strong> Max 7 working days delivery.</span>
                </p>
                <p className="flex items-start gap-2">
                  <Clock className="h-3.5 w-3.5 text-brand shrink-0 mt-0.5" />
                  <span><strong className="text-foreground font-semibold">Outside Kerala:</strong> 10 – 15 working days dispatch.</span>
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-border/40">
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>WhatsApp support: <a href="https://wa.me/918156938843" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline font-semibold">+91 8156938843</a></span>
              </p>
            </div>
          </div>

          {/* Card 2: Return & Damage Claim Policy */}
          <div className="rounded-2xl border border-border/80 bg-background/60 p-5 space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="font-display text-xs font-bold text-brand-soft flex items-center gap-2 uppercase tracking-[0.14em] border-b border-border/50 pb-2.5 mb-3">
                <ShieldCheck className="h-4 w-4 text-gold shrink-0" /> Return & Damage Claim
              </h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-amber-950 text-[11px] font-medium leading-relaxed mb-2">
                  ⚠️ <strong>Compulsory Requirement:</strong> Continuous unboxing video showing package seal to product inspection is strictly required.
                </div>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-foreground shrink-0 mt-0.5" />
                  <span><strong className="text-foreground font-semibold">Damage Claims:</strong> Returns accepted strictly for transit-damaged pieces.</span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <span><strong className="text-foreground font-semibold">No Other Exchange:</strong> No returns for color choice/preference.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Wash & Fabric Care Instructions */}
          <div className="rounded-2xl border border-border/80 bg-background/60 p-5 space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="font-display text-xs font-bold text-brand-soft flex items-center gap-2 uppercase tracking-[0.14em] border-b border-border/50 pb-2.5 mb-3">
                <Droplets className="h-4 w-4 text-blue-600 shrink-0" /> Wash & Fabric Care
              </h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0 font-bold">•</span>
                  <span>Dry clean recommended for first wash to preserve zari luster.</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0 font-bold">•</span>
                  <span>Hand wash gently in cool water with mild silk detergent.</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0 font-bold">•</span>
                  <span>Do not wring; dry flat in shade away from direct sunlight.</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0 font-bold">•</span>
                  <span>Iron on low heat setting on reverse side of saree.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RELATED SAREES SECTION */}
      <section className="mt-20">
        <div className="flex items-end justify-between border-b border-border pb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-gold font-bold">Handwoven Collection</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-brand-soft">More Creations You May Love</h2>
          </div>
          <Link
            to="/shop"
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand hover:text-brand-soft flex items-center gap-1"
          >
            Explore Catalog →
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item) => (
            <SareeCard key={item.slug} saree={item} />
          ))}
        </div>
      </section>

      {/* NOTIFY ME POPUP MODAL */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-gold/30 bg-background p-6 sm:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowNotifyModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
            >
              ✕
            </button>

            {notifySubmitted ? (
              <div className="py-8 text-center animate-in zoom-in-95">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <Check className="h-7 w-7 stroke-[3]" />
                </div>
                <h3 className="mt-4 font-display text-xl font-medium text-brand-soft">Priority Registration Logged</h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  Our studio concierge will alert you the moment this masterpiece is off the loom.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/20 text-brand-soft">
                    <Bell className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">Priority Studio Alert</p>
                    <h3 className="font-display text-lg font-semibold text-brand-soft">
                      {status === "coming_soon" ? "Register Launch Interest" : "Restock Notification"}
                    </h3>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  Enter your contact details below to receive direct SMS & email alerts for <strong>{saree.name}</strong>.
                </p>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
                    WhatsApp / Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={notifyPhone}
                    onChange={(e) => setNotifyPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-brand"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-brand py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground hover:bg-brand-soft shadow-md cursor-pointer transition-colors"
                >
                  Confirm Priority Alert →
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}