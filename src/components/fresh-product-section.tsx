import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useShopStore } from "@/lib/shop-store";
import { useCart } from "@/lib/cart";
import { sarees, type Saree } from "@/data/sarees";
import { formatPrice } from "@/lib/utils";
import {
  ShoppingBag,
  Eye,
  Check,
  Search,
  Sparkles,
  SlidersHorizontal,
  X,
  ShieldCheck,
  Heart,
} from "lucide-react";

export function FreshProductSection() {
  const { products } = useShopStore();
  const { addItem } = useCart();

  const allProducts: Saree[] = useMemo(() => {
    return products && products.length > 0 ? products : sarees;
  }, [products]);

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [quickViewProduct, setQuickViewProduct] = useState<Saree | null>(null);
  const [blouseOption, setBlouseOption] = useState<"with" | "without">("with");
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  // Categories derived from products
  const categories = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => {
      if (p.weave) set.add(p.weave);
    });
    return ["All", ...Array.from(set)];
  }, [allProducts]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((product) => {
        const matchesCategory =
          activeCategory === "All" ||
          product.weave.toLowerCase() === activeCategory.toLowerCase();
        const matchesSearch =
          searchQuery.trim() === "" ||
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.weave.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.colour.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "discount") {
          const discA = a.originalPrice ? a.originalPrice - a.price : 0;
          const discB = b.originalPrice ? b.originalPrice - b.price : 0;
          return discB - discA;
        }
        return 0; // featured default
      });
  }, [allProducts, activeCategory, searchQuery, sortBy]);

  const handleAddToCart = (product: Saree, option: "with" | "without" = "with") => {
    addItem(product, 1, option);
    setAddedToast(`Added "${product.name}" to your bag!`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const openQuickView = (product: Saree) => {
    setQuickViewProduct(product);
    setBlouseOption("with");
    setSelectedImageIndex(0);
  };

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
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

      {/* Header & Controls */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            <Sparkles className="h-3 w-3 text-gold" /> Fresh Arrival Collection
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-brand-soft sm:text-4xl">
            Explore Handwoven Sarees
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Small batch drapes crafted directly by master weavers across India.
          </p>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] sm:w-64">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, weave, colour..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-border bg-card pl-9 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-full border border-border bg-card px-4 py-2.5 text-xs font-medium text-foreground focus:border-brand focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full px-5 py-2 text-xs font-medium transition-all ${
              activeCategory.toLowerCase() === cat.toLowerCase()
                ? "bg-brand text-primary-foreground shadow-md"
                : "border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => {
            const hasDiscount = product.originalPrice && product.originalPrice > product.price;
            const discountPercent = hasDiscount
              ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
              : 0;

            return (
              <div
                key={product.slug}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-cream">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Badges */}
                  <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
                    {hasDiscount && (
                      <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white shadow-sm">
                        -{discountPercent}% OFF
                      </span>
                    )}
                    <span className="rounded-full bg-ink/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-medium tracking-wide text-gold">
                      Handloom
                    </span>
                  </div>

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-[2px]">
                    <button
                      onClick={() => openQuickView(product)}
                      className="flex items-center gap-1.5 rounded-full bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-lg transition-transform hover:scale-105"
                    >
                      <Eye className="h-3.5 w-3.5 text-brand" /> Quick View
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                    <span className="uppercase tracking-widest text-brand">{product.weave}</span>
                    <span>{product.colour}</span>
                  </div>

                  <Link
                    to="/shop/$slug"
                    params={{ slug: product.slug }}
                    className="mt-1.5 font-display text-base font-semibold text-brand-soft line-clamp-1 hover:text-brand transition-colors"
                  >
                    {product.name}
                  </Link>

                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{product.blurb}</p>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-display text-lg font-bold text-brand-soft">
                      {formatPrice(product.price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(product.originalPrice!)}
                      </span>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="mt-4 grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-brand bg-transparent py-2.5 text-xs font-semibold text-brand transition-all hover:bg-brand hover:text-primary-foreground"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" /> Add
                    </button>
                    <Link
                      to="/booking"
                      className="flex items-center justify-center rounded-xl bg-ink py-2.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.02] text-center"
                    >
                      Book Drape
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-12 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <p className="font-display text-xl font-semibold text-brand-soft">No Sarees Found</p>
          <p className="mt-2 text-xs text-muted-foreground">
            No sarees match your selected category or search filter. Try clearing filters!
          </p>
          <button
            onClick={() => {
              setActiveCategory("All");
              setSearchQuery("");
            }}
            className="mt-6 inline-block rounded-full bg-brand px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-brand-soft"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-card p-6 shadow-2xl sm:p-8">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute right-4 top-4 rounded-full bg-secondary p-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Modal Gallery */}
              <div>
                <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-cream">
                  <img
                    src={
                      quickViewProduct.views && quickViewProduct.views[selectedImageIndex]
                        ? quickViewProduct.views[selectedImageIndex].url
                        : quickViewProduct.image
                    }
                    alt={quickViewProduct.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {quickViewProduct.views && quickViewProduct.views.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {quickViewProduct.views.map((v, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`h-16 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${
                          selectedImageIndex === idx ? "border-brand" : "border-transparent"
                        }`}
                      >
                        <img src={v.url} alt={v.label} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Details */}
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-widest text-brand">
                  {quickViewProduct.weave} • {quickViewProduct.colour}
                </span>

                <h3 className="mt-2 font-display text-2xl font-semibold text-brand-soft">
                  {quickViewProduct.name}
                </h3>

                <div className="mt-3 flex items-baseline gap-3">
                  <span className="font-display text-2xl font-bold text-brand-soft">
                    {formatPrice(
                      blouseOption === "without" && quickViewProduct.withoutBlouseDiscount
                        ? quickViewProduct.price - quickViewProduct.withoutBlouseDiscount
                        : quickViewProduct.price
                    )}
                  </span>
                  {quickViewProduct.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(quickViewProduct.originalPrice)}
                    </span>
                  )}
                </div>

                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  {quickViewProduct.blurb}
                </p>

                {/* Blouse Option Selector */}
                {quickViewProduct.withoutBlouseDiscount && (
                  <div className="mt-6 rounded-2xl border border-border bg-secondary/50 p-4">
                    <p className="text-xs font-semibold text-brand-soft">Blouse Preference</p>
                    <div className="mt-2.5 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setBlouseOption("with")}
                        className={`rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                          blouseOption === "with"
                            ? "bg-brand text-primary-foreground shadow-sm"
                            : "border border-border bg-card text-muted-foreground"
                        }`}
                      >
                        With Blouse Piece
                      </button>
                      <button
                        onClick={() => setBlouseOption("without")}
                        className={`rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                          blouseOption === "without"
                            ? "bg-brand text-primary-foreground shadow-sm"
                            : "border border-border bg-card text-muted-foreground"
                        }`}
                      >
                        Without Blouse (-₹{quickViewProduct.withoutBlouseDiscount})
                      </button>
                    </div>
                  </div>
                )}

                {/* Specs */}
                <div className="mt-6 space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="font-medium text-foreground">Fabric:</span>
                    <span>{quickViewProduct.fabric}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="font-medium text-foreground">Care:</span>
                    <span>{quickViewProduct.care}</span>
                  </div>
                </div>

                {/* Modal Buttons */}
                <div className="mt-auto pt-6 flex gap-3">
                  <button
                    onClick={() => {
                      handleAddToCart(quickViewProduct, blouseOption);
                      setQuickViewProduct(null);
                    }}
                    className="flex-1 rounded-full bg-brand py-3 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-brand-soft shadow-md"
                  >
                    Add to Bag
                  </button>
                  <Link
                    to="/shop/$slug"
                    params={{ slug: quickViewProduct.slug }}
                    onClick={() => setQuickViewProduct(null)}
                    className="rounded-full border border-border px-6 py-3 text-xs font-semibold uppercase tracking-wider text-brand-soft hover:bg-secondary"
                  >
                    Full Details →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
