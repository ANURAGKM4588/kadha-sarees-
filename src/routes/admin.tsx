import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  useShopStore,
  type ExtendedSaree,
  type Order,
  type OrderStatus,
  type ProductStatus,
  type NotifyRequestStatus,
} from "@/lib/shop-store";
import { formatPrice } from "@/data/sarees";
import { resolveAssetUrl } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Truck,
  Bell,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  X,
  Send,
  MapPin,
  User,
  Phone,
  Mail,
  DollarSign,
  TrendingUp,
  Tag,
  SlidersHorizontal,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Operations & Order Tracking | Kadha Sarees" },
      {
        name: "description",
        content: "Kadha Sarees executive dashboard for inventory management, product editing, and order fulfillment tracking.",
      },
    ],
  }),
  component: AdminPage,
});

const DEFAULT_PASSCODE = "kadha2026";

const COURIER_PRESETS = [
  "BlueDart Express",
  "Delhivery",
  "DTDC Courier",
  "India Post Speed Post",
  "Xpressbees",
  "FedEx India",
];

const PRESET_IMAGES = [
  "Product/Beige Ikat Mulmul Saree.png",
  "Product/Mustard Jamdani Weave Saree.png",
  "Product/Powder Blue Tussar Silk Saree.png",
  "Product/Rust Orange Organza Saree.png",
  "Product/Sage Green Chanderi Saree.png",
  "Product/Terracotta Kantha Stitch Saree.png",
  "Product/Olive Green Chanderi Saree.png",
  "Product/Crimson Red Kanjeevaram Saree.png",
  "Product/Dusty Rose Tissue Silk Saree.png",
  "Product/Indigo Block Print Mulmul Saree.png",
];

function AdminPage() {
  const {
    products,
    orders,
    notifyRequests,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    updateOrderStatus,
    updateOrderTracking,
    updateNotifyStatus,
    deleteNotifyRequest,
    resetStore,
  } = useShopStore();

  // Authentication State
  const [passcode, setPasscode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("kadha_admin_auth") === "true";
    }
    return false;
  });
  const [passcodeError, setPasscodeError] = useState("");

  // Tab State
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "requests">("dashboard");

  // Product Filter & Search
  const [productSearch, setProductSearch] = useState("");
  const [productStatusFilter, setProductStatusFilter] = useState<string>("all");

  // Order Filter & Search
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

  // Product Add / Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ExtendedSaree | null>(null);
  const [productFormData, setProductFormData] = useState({
    name: "",
    slug: "",
    weave: "Mulmul Cotton",
    colour: "Natural Beige",
    price: 3499,
    originalPrice: 4299,
    stockQty: 5,
    status: "in_stock" as ProductStatus,
    image: PRESET_IMAGES[0],
    blurb: "",
    fabric: "100% Handspun Cotton",
    blouse: "Includes running unstitched blouse piece (80cm)",
    care: "Dry clean or gentle hand wash in cold water with mild detergent",
    blouseAvailability: "both" as "both" | "with" | "without",
    withoutBlouseDiscount: 300,
  });

  // Order Detail Drawer / Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [courierCarrier, setCourierCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [trackingSavedNotice, setTrackingSavedNotice] = useState(false);

  // Handle Passcode Unlock
  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passcode === DEFAULT_PASSCODE || passcode === "") {
      setIsUnlocked(true);
      sessionStorage.setItem("kadha_admin_auth", "true");
      setPasscodeError("");
    } else {
      setPasscodeError("Invalid passcode. Please enter the correct admin passcode.");
    }
  };

  const handleDemoUnlock = () => {
    setIsUnlocked(true);
    sessionStorage.setItem("kadha_admin_auth", "true");
    setPasscodeError("");
  };

  // Metrics Calculations
  const metrics = useMemo(() => {
    const totalRev = orders
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingOrdersCount = orders.filter((o) => o.status === "Pending" || o.status === "Processing").length;
    const shippedOrdersCount = orders.filter((o) => o.status === "Shipped").length;
    const deliveredOrdersCount = orders.filter((o) => o.status === "Delivered").length;
    const outOfStockProducts = products.filter((p) => p.status === "out_of_stock" || p.stockQty === 0).length;
    const activeProducts = products.filter((p) => p.status === "in_stock").length;

    return {
      totalRev,
      totalOrders: orders.length,
      pendingOrdersCount,
      shippedOrdersCount,
      deliveredOrdersCount,
      outOfStockProducts,
      activeProducts,
      totalProducts: products.length,
      pendingNotifyRequests: notifyRequests.filter((r) => r.status === "Pending").length,
    };
  }, [orders, products, notifyRequests]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.weave.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.slug.toLowerCase().includes(productSearch.toLowerCase());
      const matchesStatus = productStatusFilter === "all" || p.status === productStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, productSearch, productStatusFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.phone.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.email.toLowerCase().includes(orderSearch.toLowerCase());
      const matchesStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Open Modal to Add New Product
  const openAddModal = () => {
    setEditingProduct(null);
    setProductFormData({
      name: "",
      slug: "",
      weave: "Mulmul Cotton",
      colour: "Natural Beige",
      price: 3499,
      originalPrice: 4299,
      stockQty: 5,
      status: "in_stock",
      image: PRESET_IMAGES[0],
      blurb: "Handwoven with precision on traditional wooden looms.",
      fabric: "100% Organic Handspun Cotton",
      blouse: "Includes matching running unstitched blouse piece",
      care: "Dry clean recommended for initial wash",
      blouseAvailability: "both",
      withoutBlouseDiscount: 300,
    });
    setIsProductModalOpen(true);
  };

  // Open Modal to Edit Product
  const openEditModal = (product: ExtendedSaree) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      slug: product.slug,
      weave: product.weave,
      colour: product.colour,
      price: product.price,
      originalPrice: product.originalPrice || Math.round(product.price * 1.2),
      stockQty: product.stockQty ?? 1,
      status: product.status,
      image: product.image,
      blurb: product.blurb || "",
      fabric: product.fabric || "",
      blouse: product.blouse || "",
      care: product.care || "",
      blouseAvailability: product.blouseAvailability || "both",
      withoutBlouseDiscount: product.withoutBlouseDiscount || 300,
    });
    setIsProductModalOpen(true);
  };

  // Save Product Form (Add or Edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFormData.name.trim()) return;

    const generatedSlug =
      productFormData.slug.trim() ||
      productFormData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    if (editingProduct) {
      updateProduct(editingProduct.slug, {
        ...productFormData,
        slug: generatedSlug,
        image: resolveAssetUrl(productFormData.image),
        views: [{ url: resolveAssetUrl(productFormData.image), label: "Full drape" }],
      });
    } else {
      addProduct({
        ...productFormData,
        slug: generatedSlug,
        image: resolveAssetUrl(productFormData.image),
        views: [{ url: resolveAssetUrl(productFormData.image), label: "Full drape" }],
        status: productFormData.stockQty > 0 ? productFormData.status : "out_of_stock",
      });
    }
    setIsProductModalOpen(false);
  };

  // Select Order for Drawer Detail
  const openOrderDrawer = (order: Order) => {
    setSelectedOrder(order);
    setCourierCarrier(order.courierCarrier || "BlueDart Express");
    setTrackingNumber(order.trackingNumber || "");
    setEstimatedDelivery(order.estimatedDelivery || "");
    setTrackingSavedNotice(false);
  };

  // Save Order Tracking
  const handleSaveTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    updateOrderTracking(selectedOrder.id, courierCarrier, trackingNumber, estimatedDelivery);

    // If order was Pending/Processing and user entered tracking, update status to Shipped
    if ((selectedOrder.status === "Pending" || selectedOrder.status === "Processing") && trackingNumber.trim()) {
      updateOrderStatus(selectedOrder.id, "Shipped");
      setSelectedOrder((prev) => (prev ? { ...prev, status: "Shipped" } : null));
    }

    setTrackingSavedNotice(true);
    setTimeout(() => setTrackingSavedNotice(false), 3000);
  };

  if (!isUnlocked) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-16 bg-background">
        <div className="w-full max-w-md rounded-2xl border border-gold/30 bg-card p-8 shadow-xl text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gold/10 blur-2xl" />
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Lock className="h-8 w-8 text-gold" />
          </div>

          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground">
            Kadha Admin Portal
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Access executive store management, saree catalog editing, and customer order tracking.
          </p>

          <form onSubmit={handleUnlock} className="mt-6 text-left space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Admin Security Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode (kadha2026)"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
              {passcodeError && <p className="mt-1.5 text-xs text-destructive">{passcodeError}</p>}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-brand py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-md transition-all hover:bg-brand/90 cursor-pointer"
            >
              Unlock Admin Portal
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleDemoUnlock}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gold hover:underline cursor-pointer"
              >
                <Unlock className="h-3.5 w-3.5" /> 1-Click Quick Demo Unlock
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header Banner */}
      <div className="border-b border-gold/20 bg-cream/70 py-6 px-5 lg:px-8">
        <div className="mx-auto max-w-[1400px] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wider border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Store Active
              </span>
              <span className="text-xs text-muted-foreground font-mono">v2.5.0</span>
            </div>
            <h1 className="mt-1 font-display text-2xl md:text-3xl font-bold tracking-tight text-brand">
              Kadha Sarees — Executive Admin Operations
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/shop"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-medium text-foreground hover:border-gold transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" /> View Storefront
            </Link>
            <button
              onClick={() => {
                sessionStorage.removeItem("kadha_admin_auth");
                setIsUnlocked(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5" /> Lock Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-[1400px] px-5 lg:px-8 mt-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-border space-x-2 overflow-x-auto no-scrollbar pb-px">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "dashboard"
                ? "border-brand text-brand bg-brand/5 rounded-t-lg"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutDashboard className="h-4 w-4 text-gold" />
            Overall Dashboard
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "products"
                ? "border-brand text-brand bg-brand/5 rounded-t-lg"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="h-4 w-4 text-gold" />
            Product Management ({products.length})
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "orders"
                ? "border-brand text-brand bg-brand/5 rounded-t-lg"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Truck className="h-4 w-4 text-gold" />
            Order Tracking ({orders.length})
            {metrics.pendingOrdersCount > 0 && (
              <span className="ml-1 rounded-full bg-amber-500 px-2 py-0.2 text-[10px] font-bold text-white">
                {metrics.pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "requests"
                ? "border-brand text-brand bg-brand/5 rounded-t-lg"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bell className="h-4 w-4 text-gold" />
            Restock Alerts ({notifyRequests.length})
            {metrics.pendingNotifyRequests > 0 && (
              <span className="ml-1 rounded-full bg-brand px-2 py-0.2 text-[10px] font-bold text-white">
                {metrics.pendingNotifyRequests}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: OVERALL DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="mt-8 space-y-8 animate-in fade-in duration-300">
            {/* Stat Cards Grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Revenue */}
              <div className="rounded-2xl border border-gold/30 bg-card p-6 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Store Revenue
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="font-display text-2xl lg:text-3xl font-bold text-brand">
                    {formatPrice(metrics.totalRev)}
                  </span>
                  <span className="inline-flex items-center text-xs font-medium text-emerald-600">
                    <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> +18.4%
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  From {metrics.totalOrders} paid & processing customer orders
                </p>
              </div>

              {/* Total Orders */}
              <div className="rounded-2xl border border-gold/30 bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Order Fulfillment
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                    <Truck className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="font-display text-2xl lg:text-3xl font-bold text-foreground">
                    {metrics.totalOrders} <span className="text-xs font-normal text-muted-foreground">orders</span>
                  </span>
                  <span className="text-xs font-semibold text-amber-600">
                    {metrics.pendingOrdersCount} action needed
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-[10px]">
                  <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-semibold text-amber-700">
                    {metrics.pendingOrdersCount} Processing
                  </span>
                  <span className="rounded-md bg-blue-500/10 px-2 py-0.5 font-semibold text-blue-700">
                    {metrics.shippedOrdersCount} Shipped
                  </span>
                  <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-700">
                    {metrics.deliveredOrdersCount} Delivered
                  </span>
                </div>
              </div>

              {/* Saree Catalog */}
              <div className="rounded-2xl border border-gold/30 bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Saree Catalog Stock
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Package className="h-5 w-5 text-gold" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="font-display text-2xl lg:text-3xl font-bold text-foreground">
                    {metrics.activeProducts} <span className="text-xs font-normal text-muted-foreground">in stock</span>
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {metrics.totalProducts} total sarees
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {metrics.outOfStockProducts > 0 ? (
                    <span className="text-amber-600 font-semibold">
                      ⚠️ {metrics.outOfStockProducts} sarees out of stock
                    </span>
                  ) : (
                    "All sarees ready for dispatch"
                  )}
                </p>
              </div>

              {/* Back in Stock Interest */}
              <div className="rounded-2xl border border-gold/30 bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Restock Waitlist
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                    <Bell className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="font-display text-2xl lg:text-3xl font-bold text-foreground">
                    {notifyRequests.length} <span className="text-xs font-normal text-muted-foreground">requests</span>
                  </span>
                  <span className="text-xs font-semibold text-purple-600">
                    {metrics.pendingNotifyRequests} un-notified
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Customer back-in-stock alert notifications
                </p>
              </div>
            </div>

            {/* Quick Operations Bar */}
            <div className="rounded-2xl border border-gold/20 bg-cream/50 p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-base font-semibold text-brand">
                  Quick Catalog & Order Actions
                </h3>
                <p className="text-xs text-muted-foreground">
                  Perform immediate inventory updates or manage customer dispatches.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-brand/90 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-gold" /> Add New Saree Product
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:border-gold transition-colors cursor-pointer"
                >
                  <Truck className="h-4 w-4 text-gold" /> View Orders ({metrics.pendingOrdersCount} Pending)
                </button>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">Recent Customer Orders</h3>
                  <p className="text-xs text-muted-foreground">Latest transactions requiring fulfillment</p>
                </div>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs font-bold text-brand hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  View All Orders <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Saree Items</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Fulfillment Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-accent/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-foreground">{order.id}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-foreground">{order.customerName}</p>
                          <p className="text-[10px] text-muted-foreground">{order.phone}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          {order.items.map((it) => (
                            <span key={it.slug} className="block font-medium">
                              {it.name} <span className="text-muted-foreground">× {it.qty}</span>
                            </span>
                          ))}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-brand">{formatPrice(order.total)}</td>
                        <td className="py-3.5 px-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border focus:outline-none cursor-pointer ${
                              order.status === "Delivered"
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700"
                                : order.status === "Shipped"
                                ? "bg-blue-500/10 border-blue-500/30 text-blue-700"
                                : order.status === "Processing"
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-700"
                                : order.status === "Cancelled"
                                ? "bg-red-500/10 border-red-500/30 text-red-700"
                                : "bg-zinc-500/10 border-zinc-500/30 text-zinc-700"
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setActiveTab("orders");
                              openOrderDrawer(order);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-semibold text-brand hover:bg-gold/20 transition-colors cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" /> Details & Track
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT MANAGEMENT */}
        {activeTab === "products" && (
          <div className="mt-8 space-y-6 animate-in fade-in duration-300">
            {/* Control Bar: Search, Status Filter & Add Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search sarees by weave, name, or slug..."
                    className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-xs text-foreground focus:border-gold focus:outline-none"
                  />
                </div>

                <select
                  value={productStatusFilter}
                  onChange={(e) => setProductStatusFilter(e.target.value)}
                  className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground focus:border-gold focus:outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="in_stock">In Stock Only</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="coming_soon">Coming Soon</option>
                </select>
              </div>

              <button
                onClick={openAddModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-md hover:bg-brand/90 transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="h-4 w-4 text-gold" /> Add New Saree Product
              </button>
            </div>

            {/* Products Table */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="py-3.5 px-4">Saree Product</th>
                      <th className="py-3.5 px-4">Weave & Colour</th>
                      <th className="py-3.5 px-4">Selling Price</th>
                      <th className="py-3.5 px-4">Stock Qty</th>
                      <th className="py-3.5 px-4">Availability</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredProducts.map((p) => (
                      <tr key={p.slug} className="hover:bg-accent/20 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={resolveAssetUrl(p.image)}
                              alt={p.name}
                              className="h-12 w-10 rounded-lg object-cover border border-border"
                            />
                            <div>
                              <p className="font-semibold text-foreground">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{p.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-foreground">{p.weave}</p>
                          <p className="text-[10px] text-muted-foreground">{p.colour}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-brand">{formatPrice(p.price)}</p>
                          {p.originalPrice && p.originalPrice > p.price && (
                            <p className="text-[10px] text-muted-foreground line-through">
                              {formatPrice(p.originalPrice)}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                updateProduct(p.slug, { stockQty: Math.max(0, (p.stockQty || 1) - 1) })
                              }
                              className="h-6 w-6 rounded bg-muted flex items-center justify-center font-bold hover:bg-accent cursor-pointer"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold px-2">{p.stockQty ?? 1}</span>
                            <button
                              onClick={() => updateProduct(p.slug, { stockQty: (p.stockQty || 0) + 1 })}
                              className="h-6 w-6 rounded bg-muted flex items-center justify-center font-bold hover:bg-accent cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() =>
                              updateProductStatus(
                                p.slug,
                                p.status === "in_stock" ? "out_of_stock" : "in_stock"
                              )
                            }
                            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border cursor-pointer ${
                              p.status === "in_stock"
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700"
                                : p.status === "coming_soon"
                                ? "bg-purple-500/10 border-purple-500/30 text-purple-700"
                                : "bg-red-500/10 border-red-500/30 text-red-700"
                            }`}
                          >
                            {p.status === "in_stock"
                              ? "In Stock"
                              : p.status === "coming_soon"
                              ? "Coming Soon"
                              : "Out of Stock"}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-gold transition-colors cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5 text-gold" /> Edit
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove "${p.name}" from catalog?`)) {
                                deleteProduct(p.slug);
                              }
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/5 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDER TRACKING & FULFILLMENT */}
        {activeTab === "orders" && (
          <div className="mt-8 space-y-6 animate-in fade-in duration-300">
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by Order ID, customer name, email, or phone..."
                  className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-xs text-foreground focus:border-gold focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {["all", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-semibold capitalize border transition-all cursor-pointer whitespace-nowrap ${
                      orderStatusFilter === st
                        ? "bg-brand text-primary-foreground border-brand shadow-2xs"
                        : "bg-card border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st === "all" ? "All Orders" : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            <div className="grid gap-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-gold/50"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-base font-bold text-brand">{order.id}</span>
                        <span className="text-xs text-muted-foreground">({order.date})</span>
                        <span
                          className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            order.status === "Delivered"
                              ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/30"
                              : order.status === "Shipped"
                              ? "bg-blue-500/10 text-blue-700 border border-blue-500/30"
                              : order.status === "Processing"
                              ? "bg-amber-500/10 text-amber-700 border border-amber-500/30"
                              : order.status === "Cancelled"
                              ? "bg-red-500/10 text-red-700 border border-red-500/30"
                              : "bg-zinc-500/10 text-zinc-700 border border-zinc-500/30"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Customer: <strong className="text-foreground">{order.customerName}</strong> ({order.phone})
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block">Order Total</span>
                        <span className="font-display text-lg font-bold text-brand">
                          {formatPrice(order.total)}
                        </span>
                      </div>

                      <button
                        onClick={() => openOrderDrawer(order)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-brand/90 transition-all cursor-pointer"
                      >
                        <Truck className="h-4 w-4 text-gold" /> Details & Track
                      </button>
                    </div>
                  </div>

                  {/* Order Items Brief */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                      {order.items.map((it) => (
                        <div key={it.slug} className="flex items-center gap-2 bg-muted/30 rounded-lg p-1.5 pr-3">
                          <img
                            src={resolveAssetUrl(it.image)}
                            alt={it.name}
                            className="h-9 w-8 rounded object-cover border"
                          />
                          <div>
                            <p className="font-semibold text-foreground text-[11px]">{it.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              Qty: {it.qty} • {it.blouseOption === "with" ? "With Blouse" : "Without Blouse"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tracking Info Badge */}
                    <div>
                      {order.trackingNumber ? (
                        <div className="flex items-center gap-2 text-xs font-mono bg-blue-500/10 text-blue-700 px-3 py-1 rounded-lg border border-blue-500/20">
                          <Truck className="h-3.5 w-3.5" />
                          <span>
                            {order.courierCarrier}: <strong>{order.trackingNumber}</strong>
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium">⚠️ No tracking assigned yet</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: RESTOCK REQUESTS */}
        {activeTab === "requests" && (
          <div className="mt-8 space-y-6 animate-in fade-in duration-300">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h3 className="font-display text-lg font-bold text-foreground">Customer Back-in-Stock Alerts</h3>
              <p className="text-xs text-muted-foreground mb-6">
                Shoppers who requested notification for sold-out or upcoming sarees.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="py-3.5 px-4">Requested Saree</th>
                      <th className="py-3.5 px-4">Customer Details</th>
                      <th className="py-3.5 px-4">Request Date</th>
                      <th className="py-3.5 px-4">Notification Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {notifyRequests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground text-xs">
                          No restock requests recorded yet.
                        </td>
                      </tr>
                    ) : (
                      notifyRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-accent/20 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-foreground">{req.sareeName}</td>
                          <td className="py-3.5 px-4">
                            <p className="font-medium text-foreground">{req.customerEmail}</p>
                            {req.customerPhone && (
                              <p className="text-[10px] text-muted-foreground">{req.customerPhone}</p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground">{req.date}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`rounded-full px-3 py-0.5 text-[10px] font-bold ${
                                req.status === "Notified"
                                  ? "bg-emerald-500/10 text-emerald-700"
                                  : "bg-amber-500/10 text-amber-700"
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() =>
                                updateNotifyStatus(
                                  req.id,
                                  req.status === "Pending" ? "Notified" : "Pending"
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground hover:border-gold transition-colors cursor-pointer"
                            >
                              <Send className="h-3 w-3 text-gold" />{" "}
                              {req.status === "Pending" ? "Mark Notified" : "Reset Pending"}
                            </button>
                            <button
                              onClick={() => deleteNotifyRequest(req.id)}
                              className="p-1 text-red-600 hover:text-red-800 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-gold/40 bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  {editingProduct ? `Edit Saree: ${editingProduct.name}` : "Add New Saree Product"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Update inventory details, pricing, and saree specifications
                </p>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-6 space-y-4 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Saree Name *</label>
                  <input
                    type="text"
                    required
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    placeholder="e.g. Crimson Red Kanjeevaram Silk"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-foreground focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Weave Type *</label>
                  <input
                    type="text"
                    required
                    value={productFormData.weave}
                    onChange={(e) => setProductFormData({ ...productFormData, weave: e.target.value })}
                    placeholder="e.g. Kanjeevaram Silk, Mulmul, Chanderi"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-foreground focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productFormData.price}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, price: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-foreground focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Original MRP Price (₹)</label>
                  <input
                    type="number"
                    value={productFormData.originalPrice}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, originalPrice: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-foreground focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={productFormData.stockQty}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, stockQty: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-foreground focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Availability Status</label>
                  <select
                    value={productFormData.status}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, status: e.target.value as ProductStatus })
                    }
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-foreground focus:border-gold focus:outline-none cursor-pointer"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="coming_soon">Coming Soon</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Primary Image Path / URL</label>
                <input
                  type="text"
                  value={productFormData.image}
                  onChange={(e) => setProductFormData({ ...productFormData, image: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-foreground focus:border-gold focus:outline-none font-mono text-[11px]"
                />
                
                {/* Preset Image Selector */}
                <div className="mt-2">
                  <p className="text-[10px] text-muted-foreground mb-1.5">Or select from store image presets:</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {PRESET_IMAGES.map((img) => (
                      <button
                        key={img}
                        type="button"
                        onClick={() => setProductFormData({ ...productFormData, image: img })}
                        className={`h-12 w-10 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          productFormData.image === img ? "border-gold scale-105 shadow-md" : "border-border opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={resolveAssetUrl(img)} alt="Preset" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Description / Blurb</label>
                <textarea
                  rows={2}
                  value={productFormData.blurb}
                  onChange={(e) => setProductFormData({ ...productFormData, blurb: e.target.value })}
                  placeholder="Short artisanal story of this weave..."
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-foreground focus:border-gold focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Fabric Details</label>
                  <input
                    type="text"
                    value={productFormData.fabric}
                    onChange={(e) => setProductFormData({ ...productFormData, fabric: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-foreground focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Care Instructions</label>
                  <input
                    type="text"
                    value={productFormData.care}
                    onChange={(e) => setProductFormData({ ...productFormData, care: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-foreground focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="rounded-xl border border-border px-5 py-2.5 font-semibold text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand px-6 py-2.5 font-bold uppercase tracking-wider text-primary-foreground shadow-md hover:bg-brand/90 cursor-pointer"
                >
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAILS & TRACKING MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl border border-gold/40 bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Order Details & Tracking — {selectedOrder.id}
                  </h2>
                  <span
                    className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      selectedOrder.status === "Delivered"
                        ? "bg-emerald-500/10 text-emerald-700"
                        : selectedOrder.status === "Shipped"
                        ? "bg-blue-500/10 text-blue-700"
                        : "bg-amber-500/10 text-amber-700"
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Order Date: {selectedOrder.date}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2 text-xs">
              {/* Left Column: Customer & Items */}
              <div className="space-y-4">
                {/* Customer Card */}
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <h3 className="font-display text-sm font-bold text-brand flex items-center gap-1.5 mb-2">
                    <User className="h-4 w-4 text-gold" /> Customer Information
                  </h3>
                  <p className="font-semibold text-foreground">{selectedOrder.customerName}</p>
                  <p className="text-muted-foreground flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3 text-gold" /> {selectedOrder.phone}
                  </p>
                  <p className="text-muted-foreground flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3 text-gold" /> {selectedOrder.email}
                  </p>
                  <p className="text-muted-foreground flex items-start gap-1 mt-2">
                    <MapPin className="h-3 w-3 text-gold shrink-0 mt-0.5" /> {selectedOrder.address}
                  </p>
                  {selectedOrder.notes && (
                    <p className="mt-2 rounded bg-gold/10 p-2 text-[11px] font-medium text-brand">
                      Note: "{selectedOrder.notes}"
                    </p>
                  )}
                </div>

                {/* Items Card */}
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <h3 className="font-display text-sm font-bold text-brand flex items-center gap-1.5 mb-3">
                    <ShoppingBag className="h-4 w-4 text-gold" /> Ordered Saree Items
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((it) => (
                      <div key={it.slug} className="flex items-center gap-3 border-b border-border/50 pb-2">
                        <img
                          src={resolveAssetUrl(it.image)}
                          alt={it.name}
                          className="h-12 w-10 rounded object-cover border"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{it.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {it.blouseOption === "with" ? "With Blouse" : "Without Blouse"} • Qty: {it.qty}
                          </p>
                        </div>
                        <p className="font-bold text-brand">{formatPrice(it.price * it.qty)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-sm font-bold">
                    <span>Grand Total:</span>
                    <span className="text-brand font-display text-lg">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Tracking & Dispatch Controls */}
              <div className="space-y-4">
                <div className="rounded-xl border border-gold/40 bg-cream/50 p-5 shadow-xs">
                  <h3 className="font-display text-base font-bold text-brand flex items-center gap-2 mb-1">
                    <Truck className="h-5 w-5 text-gold" /> Shipping & Dispatch Tracking
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Enter courier details and tracking AWB to notify customer.
                  </p>

                  <form onSubmit={handleSaveTracking} className="space-y-3.5">
                    <div>
                      <label className="block font-semibold text-muted-foreground mb-1">
                        Order Status
                      </label>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => {
                          const newSt = e.target.value as OrderStatus;
                          updateOrderStatus(selectedOrder.id, newSt);
                          setSelectedOrder({ ...selectedOrder, status: newSt });
                        }}
                        className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:border-gold focus:outline-none cursor-pointer font-semibold"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-muted-foreground mb-1">
                        Courier Partner
                      </label>
                      <input
                        type="text"
                        value={courierCarrier}
                        onChange={(e) => setCourierCarrier(e.target.value)}
                        placeholder="e.g. BlueDart Express"
                        className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:border-gold focus:outline-none"
                      />
                      <div className="mt-1 flex flex-wrap gap-1">
                        {COURIER_PRESETS.slice(0, 4).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCourierCarrier(c)}
                            className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-accent cursor-pointer"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-muted-foreground mb-1">
                        Tracking / AWB Number
                      </label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="e.g. BD982301924IN"
                        className="w-full rounded-xl border border-border bg-card px-3.5 py-2 font-mono text-xs text-foreground focus:border-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-muted-foreground mb-1">
                        Estimated Delivery Date
                      </label>
                      <input
                        type="text"
                        value={estimatedDelivery}
                        onChange={(e) => setEstimatedDelivery(e.target.value)}
                        placeholder="e.g. 28 Aug 2026"
                        className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:border-gold focus:outline-none"
                      />
                    </div>

                    {trackingSavedNotice && (
                      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-center text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1.5">
                        <Check className="h-4 w-4" /> Tracking & Dispatch details updated!
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-brand py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-md hover:bg-brand/90 transition-all cursor-pointer"
                    >
                      Update Tracking & Notify Customer
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
