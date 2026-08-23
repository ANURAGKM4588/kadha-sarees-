import { Link, useLocation } from "@tanstack/react-router";
import { getPublicUrl } from "@/lib/utils";

export function SiteFooter() {
  const location = useLocation();


  return (
    <footer className="mt-24 bg-brand-soft text-primary-foreground">
      <div className="mx-auto max-w-[1400px] px-5 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <img
              src={getPublicUrl("logo/BRAND IDENTITY white.png")}
              alt="Kadha Sarees"
              width={160}
              height={50}
              loading="lazy"
              className="h-12 w-auto object-contain brightness-110"
            />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-primary-foreground/70">
              Handwoven sarees from family looms in Kanchipuram, Banaras and Chanderi — booked
              directly with the house.
            </p>
          </div>
          <nav className="flex flex-col gap-3 text-sm text-primary-foreground/75">
            <p className="font-display text-lg text-primary-foreground">Explore</p>
            <Link to="/shop" className="hover:text-gold">
              The Collection
            </Link>
            <Link to="/about" className="hover:text-gold">
              The House
            </Link>
            <Link to="/bag" className="hover:text-gold">
              Your Bag
            </Link>
            <Link to="/booking" className="hover:text-gold">
              Book a saree
            </Link>
          </nav>
          <div className="flex flex-col gap-3 text-sm text-primary-foreground/75">
            <p className="font-display text-lg text-primary-foreground">Concierge</p>
            <a href="mailto:kadha.shop@gmail.com" className="hover:text-gold">
              kadha.shop@gmail.com
            </a>
            <a
              href="https://wa.me/918156938843"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold"
            >
              +91 8156938843 (WhatsApp)
            </a>
            <p>Mon–Sat, 10am–7pm IST</p>
          </div>
        </div>
        <div className="mt-12 border-t border-primary-foreground/15 pt-6 text-[10px] uppercase tracking-[0.24em] text-primary-foreground/50">
          © {new Date().getFullYear()} Kadha · Handwoven in India
        </div>
      </div>
    </footer>
  );
}