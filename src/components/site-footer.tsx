import { Link, useLocation } from "@tanstack/react-router";
import { getPublicUrl } from "@/lib/utils";

export function SiteFooter() {
  const location = useLocation();

  return (
    <footer className="mt-24 bg-cream border-t border-gold/30 text-brand-soft">
      <div className="mx-auto max-w-[1400px] px-5 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <img
              src={getPublicUrl("logo/BRAND IDENTITY.png")}
              alt="Kadha Sarees"
              width={160}
              height={50}
              loading="lazy"
              className="h-12 w-auto object-contain"
            />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Handwoven sarees from family looms in Kanchipuram, Banaras and Chanderi — booked
              directly with the house.
            </p>
          </div>
          <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p className="font-display text-lg font-semibold text-brand-soft">Explore</p>
            <Link to="/shop" className="hover:text-brand transition-colors">
              The Collection
            </Link>
            <Link to="/about" className="hover:text-brand transition-colors">
              The House
            </Link>
            <Link to="/bag" className="hover:text-brand transition-colors">
              Your Bag
            </Link>
            <Link to="/booking" className="hover:text-brand transition-colors">
              Book a saree
            </Link>
          </nav>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p className="font-display text-lg font-semibold text-brand-soft">Concierge</p>
            <a href="mailto:kadha.shop@gmail.com" className="hover:text-brand transition-colors">
              kadha.shop@gmail.com
            </a>
            <a
              href="https://wa.me/918156938843"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand transition-colors"
            >
              +91 8156938843 (WhatsApp)
            </a>
            <p>Mon–Sat, 10am–7pm IST</p>
          </div>
        </div>
        <div className="mt-12 border-t border-border/80 pt-6 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          © {new Date().getFullYear()} Kadha · Handwoven in India
        </div>
      </div>
    </footer>
  );
}