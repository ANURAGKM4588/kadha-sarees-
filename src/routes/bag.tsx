import { createFileRoute, Link } from "@tanstack/react-router";
import { QuantityStepper } from "@/components/quantity-stepper";
import { formatPrice, getSaree } from "@/data/sarees";
import { useCart } from "@/lib/cart";
import { getPublicUrl } from "@/lib/utils";

export const Route = createFileRoute("/bag")({
  head: () => ({
    meta: [
      { title: "Your Bag | Kadha" },
      {
        name: "description",
        content: "Review the sarees in your Kadha bag and continue to booking.",
      },
      { property: "og:title", content: "Your Bag | Kadha" },
      { property: "og:description", content: "Review your selected Kadha sarees." },
    ],
  }),
  component: Bag,
});

function Bag() {
  const { lines, setQty, remove } = useCart();
  const items = lines.flatMap((line) => {
    const saree = getSaree(line.slug);
    return saree ? [{ ...line, saree }] : [];
  });

  const getItemPrice = (item: (typeof items)[0]) => {
    if (item.blouseOption === "without" && item.saree.withoutBlouseDiscount) {
      return Math.max(1, item.saree.price - item.saree.withoutBlouseDiscount);
    }
    return item.saree.price;
  };

  const subtotal = items.reduce((sum, i) => sum + getItemPrice(i) * i.qty, 0);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Your selection</p>
      <h1 className="mt-3 font-display text-4xl text-brand-soft">Your bag</h1>
      <div className="ornament-rule mt-4 w-32" />

      {items.length === 0 ? (
        <div className="mt-8">
          <p className="text-sm text-muted-foreground">Your bag is empty.</p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-full border border-brand px-8 py-3 text-[11px] uppercase tracking-[0.22em] text-brand transition-colors hover:bg-brand hover:text-primary-foreground whitespace-nowrap shrink-0"
          >
            Return to Home
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-10 divide-y divide-border rounded-xl border border-border bg-card px-6">
            {items.map((item) => {
              const itemPrice = getItemPrice(item);
              const itemKey = `${item.slug}-${item.blouseOption || "with"}`;
              return (
                <li key={itemKey} className="flex gap-6 py-6">
                  <img
                    src={getPublicUrl(item.saree.image)}
                    alt={item.saree.name}
                    width={912}
                    height={1200}
                    loading="lazy"
                    className="h-32 w-24 shrink-0 rounded-2xl bg-secondary object-cover border border-border/80 shadow-2xs"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="font-display text-lg">{item.saree.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
                            {item.saree.weave}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-secondary/80 text-foreground">
                            {item.blouseOption === "without" ? "🧵 Extra Blouse Piece" : "✂️ With Attached Blouse"}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm tabular-nums font-semibold whitespace-nowrap">
                        {formatPrice(itemPrice * item.qty)}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <QuantityStepper
                        value={item.qty}
                        onChange={(n) => setQty(item.slug, n, item.blouseOption)}
                      />
                      <button
                        type="button"
                        onClick={() => remove(item.slug, item.blouseOption)}
                        className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-destructive whitespace-nowrap cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>


          <div className="mt-8 flex items-center justify-between rounded-xl bg-cream px-6 py-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap">Subtotal</p>
            <p className="font-display text-2xl tabular-nums text-brand-soft whitespace-nowrap">{formatPrice(subtotal)}</p>
          </div>

          <Link
            to="/booking"
            className="mt-8 inline-block rounded-full bg-brand px-10 py-3 text-[11px] uppercase tracking-[0.22em] text-primary-foreground transition-colors hover:bg-brand-soft whitespace-nowrap shrink-0"
          >
            Proceed to booking
          </Link>
        </>
      )}
    </div>
  );
}