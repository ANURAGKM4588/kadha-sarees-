import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { ShoppingBag, Menu, X, MessageSquare, User as UserIcon, ShieldCheck } from "lucide-react";
import { getPublicUrl } from "@/lib/utils";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Saree Catalog" },
  { to: "/booking", label: "Checkout" },
  { to: "/about", label: "About Us" },
  { to: "/admin", label: "Admin" },
];

export function SiteHeader() {
  const location = useLocation();
  const { count } = useCart();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  return (
    <div className="sticky top-0 z-40">
      {/* Main E-Commerce Navigation Bar */}
      <header className="border-b border-border bg-background shadow-xs relative z-50">
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-5 lg:px-8">
          {/* Brand Logo */}
          <Link to="/" className="flex min-w-0 items-center">
            <img
              src={getPublicUrl("logo/BRAND IDENTITY.png")}
              alt="Kadha Sarees Store"
              width={160}
              height={44}
              className="h-10 w-auto object-contain sm:h-12"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-8 text-[11px] uppercase tracking-[0.18em] sm:flex">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`transition-colors whitespace-nowrap font-medium ${
                    isActive ? "text-brand font-semibold border-b-2 border-gold pb-1" : "text-muted-foreground hover:text-brand"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Shopping Bag & User Account Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/admin"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-2 text-[10px] uppercase tracking-[0.16em] font-semibold text-brand transition-all hover:bg-gold/20"
              title="Kadha Store Admin Panel"
            >
              <ShieldCheck className="h-4 w-4 text-gold" />
              <span>Admin</span>
            </Link>

            <Link
              to={user ? "/account" : "/login"}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground transition-all duration-300 hover:border-gold hover:text-brand whitespace-nowrap shadow-2xs cursor-pointer"
            >
              <UserIcon className="h-4 w-4 text-gold" />
              <span>{user ? user.name.split(" ")[0] : "Sign In"}</span>
            </Link>
          </div>

          {/* Mobile Right Bar: User Account + Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:hidden">
            <Link
              to="/admin"
              className="inline-flex items-center justify-center rounded-full border border-gold/40 bg-gold/10 p-2 text-brand"
              aria-label="Admin Panel"
            >
              <ShieldCheck className="h-5 w-5 text-gold" />
            </Link>

            <Link
              to={user ? "/account" : "/login"}
              className="inline-flex items-center justify-center rounded-full border border-border bg-card p-2 text-foreground hover:border-gold transition-colors"
              aria-label="User Account"
            >
              <UserIcon className="h-5 w-5 text-gold" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-background px-5 py-6 sm:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-4 text-xs uppercase tracking-[0.2em]">
              {navLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 transition-colors ${
                    location.pathname === item.to
                      ? "font-bold text-brand"
                      : "text-foreground hover:text-brand"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="my-2 border-t border-border pt-4 flex flex-col gap-3">
                <Link
                  to="/bag"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-brand px-5 py-3 text-primary-foreground font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" /> Shopping Bag
                  </span>
                  <span className="rounded-full bg-gold px-2.5 py-0.5 text-[10px] font-bold text-brand-soft">
                    {count} items
                  </span>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}