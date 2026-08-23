import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, type SavedAddress } from "@/lib/auth";
import { useShopStore } from "@/lib/shop-store";
import { formatPrice } from "@/data/sarees";
import { getPublicUrl } from "@/lib/utils";
import {
  User,
  MapPin,
  Package,
  Plus,
  Trash2,
  CheckCircle2,
  LogOut,
  Star,
  Phone,
  Mail,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account | Kadha Sarees" },
      {
        name: "description",
        content: "Manage your saved delivery addresses, profile, and saree booking history.",
      },
    ],
  }),
  component: AccountPage,
});

const fieldStyle =
  "w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-gold";
const labelStyle = "text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold block mb-1";

function AccountPage() {
  const { user, logout, addSavedAddress, deleteSavedAddress, setPrimaryAddress, updateProfile } = useAuth();
  const { orders } = useShopStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"addresses" | "orders" | "profile">("addresses");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  // If not logged in, redirect to login
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-28 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
          <User className="h-8 w-8" />
        </div>
        <h1 className="mt-4 font-display text-3xl text-brand-soft">Customer Account</h1>
        <p className="mt-2 text-xs text-muted-foreground">Please sign in to view your saved addresses and orders.</p>
        <Link
          to="/login"
          className="mt-8 inline-block rounded-full bg-brand px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground hover:bg-brand-soft shadow-md"
        >
          Sign In / Register →
        </Link>
      </div>
    );
  }

  // Filter user orders
  const myOrders = orders.filter(
    (o) =>
      (user.email && o.email?.toLowerCase() === user.email.toLowerCase()) ||
      (user.phone && o.phone?.includes(user.phone))
  );

  const handleAddAddress = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const label = formData.get("label") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;

    addSavedAddress({ label, name, phone, address, isPrimary: false });
    setShowAddAddress(false);
  };

  const handleUpdateProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;

    updateProfile({ name, phone });
    setEditingProfile(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-primary-foreground font-display text-2xl font-bold shadow-md shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-semibold text-brand-soft">{user.name}</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                <ShieldCheck className="h-3 w-3" /> Customer
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-gold" /> {user.email}
              </span>
              {user.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-gold" /> {user.phone}
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            logout();
            navigate({ to: "/" });
          }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:bg-red-500/10 hover:text-red-700 hover:border-red-500/30 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="mt-8 flex overflow-x-auto gap-2 border-b border-border pb-3 no-scrollbar">
        {[
          { id: "addresses", label: "Saved Delivery Addresses", icon: MapPin, badge: user.addresses.length },
          { id: "orders", label: "My Saree Bookings", icon: Package, badge: myOrders.length },
          { id: "profile", label: "Account Profile", icon: User, badge: null },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-brand text-primary-foreground shadow-md"
                  : "border border-border text-muted-foreground hover:border-gold hover:text-brand bg-card"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isActive ? "bg-gold text-brand-soft" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: SAVED ADDRESSES */}
      {activeTab === "addresses" && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-brand-soft">Saved Delivery Addresses</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Saved addresses are automatically available during saree checkout.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground hover:bg-brand-soft shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Address
            </button>
          </div>

          {/* ADD ADDRESS FORM */}
          {showAddAddress && (
            <form onSubmit={handleAddAddress} className="rounded-3xl border border-gold/30 bg-card p-6 space-y-4 shadow-md animate-in fade-in">
              <h3 className="font-display text-lg font-medium text-brand-soft">Add New Shipping Address</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelStyle}>Address Label *</label>
                  <input name="label" required placeholder="e.g. Home, Office, Studio" className={fieldStyle} defaultValue="Home" />
                </div>
                <div>
                  <label className={labelStyle}>Recipient Name *</label>
                  <input name="name" required placeholder="Recipient Full Name" className={fieldStyle} defaultValue={user.name} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelStyle}>Contact Phone *</label>
                  <input name="phone" required placeholder="+91 98765 43210" className={fieldStyle} defaultValue={user.phone} />
                </div>
              </div>
              <div>
                <label className={labelStyle}>Full Delivery Address *</label>
                <textarea name="address" rows={3} required placeholder="House/Flat No., Building, Street, City, State, Pincode" className={fieldStyle} />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAddress(false)}
                  className="rounded-full border border-border px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-brand px-6 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground hover:bg-brand-soft shadow-xs"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          {/* ADDRESS CARDS GRID */}
          {user.addresses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
              <MapPin className="mx-auto h-10 w-10 text-muted-foreground/60" />
              <p className="mt-3 font-display text-lg text-brand-soft">No saved addresses yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Add your delivery address to enjoy 1-click checkout on future bookings.</p>
              <button
                type="button"
                onClick={() => setShowAddAddress(true)}
                className="mt-5 rounded-full border border-brand px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand hover:bg-brand hover:text-primary-foreground cursor-pointer"
              >
                + Add First Address
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {user.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`relative rounded-3xl border p-6 space-y-3 transition-all ${
                    addr.isPrimary
                      ? "border-gold/60 bg-cream/30 shadow-sm"
                      : "border-border bg-card hover:border-gold/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 font-display text-base font-semibold text-brand-soft">
                      <MapPin className="h-4 w-4 text-gold" /> {addr.label}
                    </span>
                    {addr.isPrimary ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-900 border border-gold/40">
                        <Star className="h-3 w-3 fill-amber-700 text-amber-700" /> Primary
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPrimaryAddress(addr.id)}
                        className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-brand cursor-pointer"
                      >
                        Set as Primary
                      </button>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-foreground">{addr.name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{addr.address}</p>
                  <p className="text-xs font-medium text-foreground">Phone: {addr.phone}</p>

                  <div className="pt-2 border-t border-border flex justify-end">
                    <button
                      type="button"
                      onClick={() => deleteSavedAddress(addr.id)}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-red-700 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY ORDERS */}
      {activeTab === "orders" && (
        <div className="mt-8 space-y-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-brand-soft">My Saree Bookings</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track the status of all handwoven saree bookings associated with your account.
            </p>
          </div>

          {myOrders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
              <Package className="mx-auto h-10 w-10 text-muted-foreground/60" />
              <p className="mt-3 font-display text-lg text-brand-soft">No bookings found</p>
              <p className="mt-1 text-xs text-muted-foreground">You haven't placed any saree bookings with this account yet.</p>
              <Link
                to="/booking"
                className="mt-6 inline-block rounded-full bg-brand px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground hover:bg-brand-soft shadow-md"
              >
                Book a Saree →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((order) => (
                <div key={order.id} className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Booking ID</span>
                      <p className="font-mono text-lg font-bold text-gold">{order.id}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Date</span>
                      <p className="text-xs font-medium text-foreground">{order.date}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Total</span>
                      <p className="font-display text-lg font-bold text-brand-soft">{formatPrice(order.total)}</p>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          order.status === "Pending"
                            ? "bg-amber-100 text-amber-800"
                            : order.status === "Confirmed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        ● {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Reserved Items:</p>
                    <div className="flex flex-wrap gap-4">
                      {order.items.map((item) => (
                        <div key={item.slug} className="flex items-center gap-3 bg-muted/40 p-2.5 rounded-2xl border border-border">
                          {item.image && (
                            <img src={getPublicUrl(item.image)} alt={item.name} className="h-12 w-9 rounded-lg object-cover bg-secondary" />
                          )}
                          <div>
                            <p className="font-display text-xs font-semibold text-foreground">{item.name}</p>
                            <p className="text-[11px] text-muted-foreground">Qty: {item.qty} × {formatPrice(item.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ACCOUNT PROFILE */}
      {activeTab === "profile" && (
        <div className="mt-8 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-brand-soft">Account Profile Details</h2>
                <p className="text-xs text-muted-foreground">Manage your personal contact details.</p>
              </div>

              {!editingProfile && (
                <button
                  type="button"
                  onClick={() => setEditingProfile(true)}
                  className="rounded-full border border-border bg-background px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand hover:border-gold cursor-pointer"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {editingProfile ? (
              <form onSubmit={handleUpdateProfileSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className={labelStyle}>Full Name *</label>
                  <input name="name" defaultValue={user.name} required className={fieldStyle} />
                </div>
                <div>
                  <label className={labelStyle}>Phone Number *</label>
                  <input name="phone" defaultValue={user.phone} required className={fieldStyle} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingProfile(false)}
                    className="rounded-full border border-border px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-brand px-6 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground hover:bg-brand-soft"
                  >
                    Save Profile
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 text-sm">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Full Name</span>
                  <p className="font-semibold text-foreground text-base mt-0.5">{user.name}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Email Address</span>
                  <p className="font-medium text-foreground mt-0.5">{user.email}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Phone Number</span>
                  <p className="font-medium text-foreground mt-0.5">{user.phone || "Not set"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Account ID</span>
                  <p className="font-mono text-xs text-gold font-bold mt-0.5">{user.id}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
