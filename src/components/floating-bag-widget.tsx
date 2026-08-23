import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { useShopStore } from "@/lib/shop-store";
import { formatPrice, getSaree } from "@/data/sarees";
import {
  ShoppingBag,
  ChevronDown,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function FloatingBagWidget() {
  const { products } = useShopStore();
  const { lines, count, setQty, remove } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [justAdded, setJustAdded] = useState(false);
  const lastScrollY = useRef(0);
  const prevCountRef = useRef(count);
  const ticking = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 120 FPS Apple-style Scroll direction listener with requestAnimationFrame & hardware acceleration
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY > 120) {
            const diff = currentScrollY - lastScrollY.current;
            if (diff > 12) {
              // Scrolling DOWN: Slide button out smoothly to bottom
              setIsVisible(false);
            } else if (diff < -12) {
              // Scrolling UP: Slide button back smoothly into view
              setIsVisible(true);
            }
          } else {
            // Near top of page: Always visible
            setIsVisible(true);
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Trigger animate-in and glowing pop effect when product is added to the bag
  useEffect(() => {
    if (count > prevCountRef.current) {
      setIsVisible(true);
      setJustAdded(true);
      if (typeof window !== "undefined") {
        lastScrollY.current = window.scrollY;
      }
      const timer = setTimeout(() => {
        setJustAdded(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = count;
  }, [count]);

  // Resolve cart lines to products with computed prices
  const items = lines.flatMap((line) => {
    const saree = products.find((p) => p.slug === line.slug) || getSaree(line.slug);
    if (!saree) return [];
    const discount = line.blouseOption === "without" ? saree.withoutBlouseDiscount || 0 : 0;
    const effectivePrice = Math.max(0, (saree.price || 0) - discount);
    return [{ ...line, saree, effectivePrice }];
  });

  const subtotal = items.reduce((sum, item) => sum + item.effectivePrice * item.qty, 0);

  // Auto close expanded drawer when navigating to checkout
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Do not render on Admin panel, Booking / Checkout, or Bag page
  if (
    location.pathname.startsWith("/admin") ||
    location.pathname === "/booking" ||
    location.pathname === "/bag"
  ) {
    return null;
  }

  return (
    <aside
      aria-label="Floating Shopping Bag"
      className={`fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end transform-gpu will-change-transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        (isVisible || isOpen) && count > 0
          ? "translate-y-0 scale-100 opacity-100 pointer-events-auto"
          : "translate-y-[130%] scale-90 opacity-0 pointer-events-none"
      }`}
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      {/* EXPANDED DYNAMIC BAG PANEL (Light Theme Vertical Shape Popup) */}
      {isOpen && (
        <div
          className="mb-3 w-[calc(100vw-32px)] sm:w-[380px] max-h-[580px] flex flex-col rounded-[32px] border border-border bg-card text-foreground shadow-[0_30px_70px_-15px_rgba(0,0,0,0.2)] backdrop-blur-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden origin-bottom-right"
        >
          {/* Panel Header (Light Theme) */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-secondary/80">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand font-bold shadow-2xs border border-brand/20">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold tracking-wide text-brand-soft">Your Shopping Bag</h3>
                <p className="text-[10px] text-muted-foreground font-medium">{count} {count === 1 ? "item" : "items"} selected</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
              aria-label="Collapse Bag"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {/* Item List Scroll Area (Light Theme) */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 no-scrollbar max-h-[320px]">
            {items.map((line) => (
              <div
                key={`${line.saree.slug}-${line.blouseOption || "with"}`}
                className="flex items-center gap-3.5 rounded-2xl bg-secondary/40 p-3 border border-border/80 transition-colors hover:border-gold/50 shadow-2xs"
              >
                {/* Product Thumbnail */}
                <Link
                  to="/shop/$slug"
                  params={{ slug: line.saree.slug }}
                  onClick={() => setIsOpen(false)}
                  className="h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-background border border-border/60"
                >
                  <img
                    src={line.saree.image}
                    alt={line.saree.name}
                    className="h-full w-full object-cover object-center"
                  />
                </Link>

                {/* Info & Quantity */}
                <div className="flex-1 min-w-0">
                  <Link
                    to="/shop/$slug"
                    params={{ slug: line.saree.slug }}
                    onClick={() => setIsOpen(false)}
                    className="hover:underline"
                  >
                    <h4 className="font-display text-xs font-semibold text-foreground truncate">
                      {line.saree.status === "coming_soon" ? "Coming Soon" : line.saree.name}
                    </h4>
                  </Link>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {line.blouseOption === "without" ? "✂️ Without Blouse" : "🧵 With Blouse"}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-display text-xs font-bold text-emerald-800 tabular-nums">
                      {formatPrice(line.effectivePrice * line.qty)}
                    </span>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1.5 rounded-full bg-background px-2 py-0.5 border border-border shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setQty(line.saree.slug, line.qty - 1, line.blouseOption)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Decrease Quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-4 text-center font-mono text-[11px] font-bold text-foreground">
                        {line.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(line.saree.slug, line.qty + 1, line.blouseOption)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Increase Quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => remove(line.saree.slug, line.blouseOption)}
                  className="p-1.5 text-muted-foreground/60 hover:text-destructive transition-colors cursor-pointer"
                  title="Remove from bag"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Subtotal & Action Footer (Light Theme) */}
          <div className="border-t border-border bg-secondary/60 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-display text-base font-extrabold text-brand-soft tabular-nums">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="text-[10px] text-emerald-800 font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-gold" /> Includes taxes & free shipping in Kerala
            </p>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate({ to: "/booking" });
                }}
                className="w-full rounded-full bg-brand px-4 py-3.5 text-center text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground hover:bg-brand-soft transition-all cursor-pointer flex items-center justify-center gap-2 group shadow-md"
              >
                <span>Checkout</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COLLAPSED FLOATING PILL BUTTON */}
      <button
        id="floating-bag-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center gap-2.5 rounded-full px-5 py-3 backdrop-blur-xl transition-all duration-300 active:scale-95 cursor-pointer border border-white/20 transform-gpu ${
          justAdded
            ? "bg-gold text-brand-soft ring-4 ring-gold/70 scale-110 shadow-[0_0_35px_rgba(212,175,55,0.6)] animate-bounce"
            : "bg-brand text-white hover:scale-105 hover:bg-brand-soft shadow-xl"
        }`}
      >
        {/* White Shopping Bag Icon with Top-Right Badge */}
        <div className="relative inline-flex items-center justify-center">
          <ShoppingBag className={`h-5 w-5 transition-transform duration-300 ${justAdded ? "scale-125 text-brand-soft animate-pulse" : "text-white"}`} />
          <span className={`absolute -top-2 -right-2.5 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-extrabold ring-2 transition-all duration-300 ${
            justAdded 
              ? "bg-white text-brand ring-brand scale-125 animate-in zoom-in-125 duration-300"
              : "bg-gold text-brand-soft ring-brand"
          }`}>
            {count}
          </span>
        </div>

        <span className={`text-xs font-bold uppercase tracking-[0.2em] pl-1 transition-colors duration-300 ${justAdded ? "text-brand-soft font-black" : "text-white"}`}>
          Bag
        </span>
      </button>
    </aside>
  );
}
