import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { formatPrice, type Saree } from "@/data/sarees";
import { useShopStore } from "@/lib/shop-store";
import { useCart } from "@/lib/cart";
import { triggerFlyToCartAnimation } from "@/lib/fly-to-cart";
import { ShoppingBag, Check } from "lucide-react";
import { getPublicUrl } from "@/lib/utils";

export function SareeCard({ saree, tall = false }: { saree: Saree; tall?: boolean }) {
  const { products, incrementCartAdds } = useShopStore();
  const { lines, add } = useCart();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const stored = products.find((p) => p.slug === saree.slug);
  const status = stored?.status || "in_stock";
  const isInCart = lines.some((line) => line.slug === saree.slug);

  // Extract all product view images (Full drape, Model, Weave detail)
  const viewImages = saree.views && saree.views.length > 0 ? saree.views : [{ url: saree.image, label: "Full drape" }];
  const currentImage = getPublicUrl(viewImages[currentViewIndex]?.url || saree.image);

  // Fast auto-carousel on mouse hover (600ms per slide)
  useEffect(() => {
    if (!isHovered || viewImages.length <= 1) {
      setCurrentViewIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentViewIndex((prev) => (prev + 1) % viewImages.length);
    }, 600);

    return () => clearInterval(interval);
  }, [isHovered, viewImages.length]);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status !== "in_stock") return;

    // Trigger macOS Genie Fly-to-Cart Animation
    triggerFlyToCartAnimation(imgRef.current);

    add(saree.slug);
    incrementCartAdds(saree.slug);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBookNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status !== "in_stock") return;

    triggerFlyToCartAnimation(imgRef.current);
    add(saree.slug);
    incrementCartAdds(saree.slug);
    navigate({ to: "/booking" });
  };

  // Calculate original MRP & discount %
  const originalMrp =
    saree.originalPrice && saree.originalPrice > saree.price
      ? saree.originalPrice
      : Math.round(saree.price * 1.25);
  const discountPercent = Math.round(((originalMrp - saree.price) / originalMrp) * 100);

  return (
    <div
      className="group relative flex h-full flex-col cursor-pointer"
      onMouseEnter={() => {
        setIsHovered(true);
        if (viewImages.length > 1) {
          setCurrentViewIndex(1); // Immediately switch image the exact moment mouse enters!
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentViewIndex(0);
      }}
    >
      <div className={`relative w-full overflow-hidden rounded-3xl bg-secondary shadow-xs ${tall ? "aspect-[4/5]" : "aspect-[3/4]"}`}>
        <Link to="/shop/$slug" params={{ slug: saree.slug }} className="block h-full w-full">
          <img
            ref={imgRef}
            src={currentImage}
            alt={`${saree.name} — ${saree.weave} saree`}
            width={912}
            height={1200}
            loading="lazy"
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>
        
        {/* Status or Weave Badge */}
        <div className="absolute left-3 top-3 sm:left-4 sm:top-4 flex flex-col gap-1.5 items-start z-10 pointer-events-none">
          <span className="glass-panel rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.16em] text-brand-soft whitespace-nowrap">
            {saree.weave}
          </span>
          {status === "out_of_stock" && (
            <span className="rounded-full bg-destructive/90 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.16em] text-destructive-foreground shadow-sm whitespace-nowrap">
              Out of Stock
            </span>
          )}
          {status === "coming_soon" && (
            <span className="rounded-full bg-gold px-2.5 py-0.5 sm:px-3 sm:py-1 text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-soft shadow-sm gold-frame whitespace-nowrap">
              Coming Soon
            </span>
          )}
        </div>

        {/* QUICK ADD TO CART BUTTON (Top-Right on Card) */}
        <button
          type="button"
          onClick={handleQuickAdd}
          title={
            status !== "in_stock"
              ? status.replace("_", " ")
              : isInCart
              ? "Added to Bag (Click to add another)"
              : "Add Saree to Shopping Bag"
          }
          disabled={status !== "in_stock"}
          className={`absolute right-3 top-3 sm:right-4 sm:top-4 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border shadow-lg backdrop-blur-xs transition-all duration-300 cursor-pointer ${
            added || isInCart
              ? "bg-brand text-white border-brand scale-105 shadow-emerald-900/30"
              : status === "in_stock"
              ? "bg-white/95 text-brand border-gold/40 hover:bg-gold hover:text-brand-soft hover:scale-110 active:scale-95"
              : "bg-slate-200/80 text-slate-400 border-slate-300 cursor-not-allowed opacity-60"
          }`}
        >
          {added || isInCart ? (
            <Check className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5] text-white animate-in zoom-in-50" />
          ) : (
            <ShoppingBag className="h-4 w-4" />
          )}
        </button>

        {/* HOVER ACTION BUTTONS OVERLAY (Animated slide-up on mouse enter) */}
        <div className="absolute inset-x-3 bottom-3 z-20 flex items-center gap-2 translate-y-12 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate({ to: "/shop/$slug", params: { slug: saree.slug } });
            }}
            className="flex-1 rounded-full bg-white/95 backdrop-blur-md px-3 py-2.5 text-center text-[10px] uppercase tracking-[0.18em] font-semibold text-brand shadow-lg border border-white/60 transition-all hover:bg-brand hover:text-white hover:border-brand active:scale-95 whitespace-nowrap cursor-pointer"
          >
            View Details
          </button>

          {status === "in_stock" ? (
            <button
              type="button"
              onClick={handleBookNow}
              className="flex-1 rounded-full bg-brand/95 backdrop-blur-md px-3 py-2.5 text-center text-[10px] uppercase tracking-[0.18em] font-semibold text-white shadow-lg border border-gold/40 transition-all hover:bg-brand-soft hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
            >
              Book Now →
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate({ to: "/shop/$slug", params: { slug: saree.slug } });
              }}
              className="flex-1 rounded-full bg-slate-900/90 backdrop-blur-md px-3 py-2.5 text-center text-[10px] uppercase tracking-[0.18em] font-semibold text-white shadow-lg border border-white/20 transition-all hover:bg-slate-800 whitespace-nowrap cursor-pointer"
            >
              Notice Me
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-1 pt-3">
        <Link to="/shop/$slug" params={{ slug: saree.slug }} className="hover:underline">
          <h3 className="font-display text-sm sm:text-base font-semibold leading-tight text-slate-900 line-clamp-2">
            {status === "coming_soon" ? "Coming Soon" : saree.name}
          </h3>
        </Link>
        <p className="mt-0.5 text-[11px] sm:text-xs text-slate-500 truncate">{saree.colour} · Handwoven</p>

        {/* PRICING & OFFER BLOCK */}
        {status !== "coming_soon" && (
          <div className="mt-2 flex items-center flex-wrap gap-1.5">
            <span className="font-display text-base sm:text-lg font-extrabold tabular-nums text-emerald-800 dark:text-emerald-400">
              {formatPrice(saree.price)}
            </span>
            {originalMrp > saree.price && (
              <span className="text-xs text-slate-400 line-through font-sans tabular-nums font-normal">
                {formatPrice(originalMrp)}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200/60">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        )}

        {/* BLOUSE BADGE */}
        {saree.blouseAvailability && saree.blouseAvailability !== "none" && (
          <div className="mt-1.5 flex items-center">
            <span className="text-[9px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/80">
              {saree.blouseAvailability === "with_only"
                ? "✂️ Attached Blouse"
                : saree.blouseAvailability === "without_only"
                ? "🧵 Extra Blouse"
                : "✂️ Both Options"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}