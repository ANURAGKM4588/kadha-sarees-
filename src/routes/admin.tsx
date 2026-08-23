import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  useShopStore,
  type ProductStatus,
  type OrderStatus,
  type NotifyRequestStatus,
  type ExtendedSaree,
  type Order,
} from "@/lib/shop-store";
import { formatPrice, weaves, type BlouseAvailability } from "@/data/sarees";
import { getPublicUrl } from "@/lib/utils";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

import {
  DollarSign,
  ShoppingCart,
  Package,
  BellRing,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Mail,
  Phone,
  Eye,
  Trash2,
  Edit3,
  SlidersHorizontal,
  ChevronRight,
  Send,
  Layers,
  ArrowUpRight,
  AlertCircle,
  Image as ImageIcon,
  UploadCloud,
  Check,
  X,
  MapPin,
  User,
  MessageSquare,
  GripVertical,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | Kadha Sarees" },
      {
        name: "description",
        content: "Kadha Sarees Store Admin Panel — Products, Orders, Stock Alerts & Analytics.",
      },
    ],
  }),
  component: AdminPanel,
});

import {
  getSentEmailLogs,
  sendOrderConfirmationEmail,
  getEmailTemplateConfig,
  saveEmailTemplateConfig,
  DEFAULT_EMAIL_TEMPLATE,
  generateOrderEmailHtml,
  type SentEmailLog,
  type EmailTemplateConfig,
} from "@/lib/email-service";

type TabType = "overview" | "orders" | "products" | "notify" | "cart_analytics" | "emails";

const PRESET_IMAGES: { url: string; label: string }[] = [];

export function AdminPanel() {
  const {
    products,
    orders,
    notifyRequests,
    updateProductStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    reorderProducts,
    updateOrderStatus,
    updateNotifyStatus,
    deleteNotifyRequest,
    resetStore,
  } = useShopStore();

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Drag and drop product reordering state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropTargetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropTargetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updatedList = [...products];
    const [movedItem] = updatedList.splice(draggedIndex, 1);
    updatedList.splice(dropTargetIndex, 0, movedItem);

    reorderProducts(updatedList);
    showToast(`Reordered "${movedItem.name}" to position #${dropTargetIndex + 1}!`);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Filters state
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [notifyFilter, setNotifyFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ExtendedSaree | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Email Template Automation State
  const [emailConfig, setEmailConfig] = useState<EmailTemplateConfig>(getEmailTemplateConfig());
  const [activeEmailSubTab, setActiveEmailSubTab] = useState<"editor" | "logs">("editor");
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Lock background page scroll when order details modal is open
  useEffect(() => {
    if (selectedOrder) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedOrder]);

  // KPI Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== "Cancelled" ? o.total : 0), 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === "Pending").length;
  const processingOrdersCount = orders.filter((o) => o.status === "Processing").length;
  const completedOrdersCount = orders.filter((o) => o.status === "Completed").length;

  const totalProductsCount = products.length;
  const inStockProductsCount = products.filter((p) => p.status === "in_stock").length;
  const outOfStockProductsCount = products.filter((p) => p.status === "out_of_stock").length;
  const comingSoonProductsCount = products.filter((p) => p.status === "coming_soon").length;

  const totalCartAddsCount = products.reduce((sum, p) => sum + p.cartAddsCount, 0);

  const totalNotifyRequests = notifyRequests.length;
  const pendingNotifyRequests = notifyRequests.filter((r) => r.status === "Pending").length;
  const outOfStockRequestsCount = notifyRequests.filter((r) => r.type === "out_of_stock").length;
  const comingSoonRequestsCount = notifyRequests.filter((r) => r.type === "coming_soon").length;

  // Chart Data Preparation
  const chartStockData = [
    { name: "In Stock", value: inStockProductsCount, color: "#047857" },
    { name: "Out of Stock", value: outOfStockProductsCount, color: "#dc2626" },
    { name: "Coming Soon", value: comingSoonProductsCount, color: "#d97706" },
  ];

  const topCartProductsData = [...products]
    .sort((a, b) => b.cartAddsCount - a.cartAddsCount)
    .slice(0, 5)
    .map((p) => ({
      name: p.name.length > 15 ? p.name.substring(0, 15) + "..." : p.name,
      cartAdds: p.cartAddsCount,
      price: p.price,
    }));

  // Filtered Lists
  const filteredOrders = orders.filter((o) => {
    const matchesFilter = orderFilter === "all" || o.status.toLowerCase() === orderFilter.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredProducts = products.filter((p) => {
    const matchesFilter = productFilter === "all" || p.status === productFilter;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.weave.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredNotifyRequests = notifyRequests.filter((r) => {
    const matchesFilter =
      notifyFilter === "all" ||
      r.status.toLowerCase() === notifyFilter.toLowerCase() ||
      r.type === notifyFilter;
    const matchesSearch =
      !searchQuery ||
      r.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.sareeName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background pb-16 font-sans text-foreground">
      {/* Top Header Banner */}
      <div className="bg-brand-soft text-primary-foreground py-10 px-5 lg:px-8 border-b border-gold/20">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-gold gold-frame">
                  <Sparkles className="h-3 w-3" /> Kadha Studio Admin
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-medium text-emerald-300">
                  ● Live Data
                </span>
              </div>
              <h1 className="mt-2 font-display text-3xl sm:text-4xl text-primary-foreground">
                E-Commerce Management Center
              </h1>
              <p className="mt-1 text-xs text-primary-foreground/75">
                Monitor sales revenue, manage order bookings, restock alerts & product catalog.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete ALL saree products and start completely freshly from scratch?")) {
                    resetStore();
                    showToast("All product records and stock details cleared cleanly!");
                  }
                }}
                className="inline-flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-destructive hover:bg-destructive hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <Trash2 className="h-4 w-4" /> Clear All Stock Products
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("products");
                  setShowAddProductModal(true);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-soft transition-colors hover:bg-gold-soft shadow-md cursor-pointer whitespace-nowrap"
              >
                <Plus className="h-4 w-4" /> Add New Product
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-[1400px] px-5 lg:px-8 mt-8">
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 border-b border-border pb-3 no-scrollbar">
          {[
            { id: "overview", label: "Dashboard Overview", icon: Layers, badge: null },
            { id: "orders", label: "Orders", icon: ShoppingCart, badge: pendingOrdersCount },
            { id: "products", label: "Products & Stock", icon: Package, badge: totalProductsCount },
            { id: "notify", label: "Restock & Coming Soon Requests", icon: BellRing, badge: pendingNotifyRequests },
            { id: "cart_analytics", label: "Cart Activity", icon: TrendingUp, badge: totalCartAddsCount },
            { id: "emails", label: "Automated Customer Emails", icon: Mail, badge: getSentEmailLogs().length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-brand text-primary-foreground shadow-md"
                    : "border border-border text-muted-foreground hover:border-gold hover:text-brand bg-card"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
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

        {/* TOP KPI METRICS CARDS */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Revenue */}
          <div className="glass-card rounded-3xl p-5 border border-gold/30 bg-card">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Total Revenue</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-brand-soft tabular-nums">
              {formatPrice(totalRevenue)}
            </p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Confirmed Orders</span>
              <span className="font-semibold text-emerald-600">Avg {formatPrice(totalOrdersCount ? Math.round(totalRevenue / totalOrdersCount) : 0)}</span>
            </div>
          </div>

          {/* Orders */}
          <div className="glass-card rounded-3xl p-5 border border-gold/30 bg-card">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Bookings</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <ShoppingCart className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-foreground tabular-nums">
              {totalOrdersCount} <span className="text-xs font-normal text-muted-foreground">Orders</span>
            </p>
            <div className="mt-2 flex items-center gap-2 text-[11px]">
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-medium text-amber-700">
                {pendingOrdersCount} Pending
              </span>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-medium text-emerald-700">
                {completedOrdersCount} Done
              </span>
            </div>
          </div>

          {/* Published Products */}
          <div className="glass-card rounded-3xl p-5 border border-gold/30 bg-card">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Published Products</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-foreground tabular-nums">
              {totalProductsCount} <span className="text-xs font-normal text-muted-foreground">Sarees</span>
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium">
              <span className="text-emerald-600">{inStockProductsCount} In Stock</span> ·{" "}
              <span className="text-destructive">{outOfStockProductsCount} Out</span> ·{" "}
              <span className="text-amber-600">{comingSoonProductsCount} Soon</span>
            </div>
          </div>

          {/* Cart Added Count */}
          <div className="glass-card rounded-3xl p-5 border border-gold/30 bg-card">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Total Cart Adds</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-foreground tabular-nums">
              {totalCartAddsCount} <span className="text-xs font-normal text-muted-foreground">Times</span>
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground">High customer interest items</p>
          </div>

          {/* Restock & Coming Soon Requests */}
          <div className="glass-card rounded-3xl p-5 border border-gold/30 bg-card">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Notify Requests</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                <BellRing className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-foreground tabular-nums">
              {totalNotifyRequests} <span className="text-xs font-normal text-muted-foreground">Alerts</span>
            </p>
            <div className="mt-2 flex items-center gap-2 text-[11px]">
              <span className="font-semibold text-blue-600">{pendingNotifyRequests} Pending</span>
              <span className="text-muted-foreground font-normal">({outOfStockRequestsCount} Restock, {comingSoonRequestsCount} Launch)</span>
            </div>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="mt-8 space-y-8">
            {/* Visual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Product Stock Breakdown Chart */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h3 className="font-display text-lg text-brand-soft">Stock Status Distribution</h3>
                    <p className="text-xs text-muted-foreground">Catalog products breakdown</p>
                  </div>
                  <Package className="h-5 w-5 text-gold" />
                </div>
                <div className="mt-4 w-full h-56">
                  <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={180} debounce={50}>
                    <PieChart>
                      <Pie
                        data={chartStockData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        isAnimationActive={false}
                      >
                        {chartStockData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} Sarees`, "Count"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 text-xs font-medium pt-2">
                  <span className="flex items-center gap-1 text-emerald-700">● In Stock ({inStockProductsCount})</span>
                  <span className="flex items-center gap-1 text-destructive">● Out of Stock ({outOfStockProductsCount})</span>
                  <span className="flex items-center gap-1 text-amber-700">● Coming Soon ({comingSoonProductsCount})</span>
                </div>
              </div>

              {/* Top Cart Added Sarees Chart */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs lg:col-span-2">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h3 className="font-display text-lg text-brand-soft">Most Added to Bag</h3>
                    <p className="text-xs text-muted-foreground">Top Sarees added to user shopping bags</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-gold" />
                </div>
                <div className="mt-4 w-full h-64">
                  <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={200} debounce={50}>
                    <BarChart data={topCartProductsData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(val) => [`${val} Cart Adds`, "Count"]} />
                      <Bar dataKey="cartAdds" fill="var(--brand)" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Quick Management Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Orders */}
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h3 className="font-display text-xl text-brand-soft">Recent Orders</h3>
                    <p className="text-xs text-muted-foreground">Latest saree booking requests</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("orders")}
                    className="text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1"
                  >
                    View All Orders <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-4 divide-y divide-border">
                  {orders.slice(0, 4).map((order) => (
                    <div key={order.id} className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-foreground">{order.id}</span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                              order.status === "Pending"
                                ? "bg-amber-100 text-amber-800"
                                : order.status === "Processing"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "Completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.items.length} item(s) · {order.date}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-display text-base font-semibold tabular-nums text-brand-soft">
                          {formatPrice(order.total)}
                        </p>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="mt-1 text-[11px] text-muted-foreground hover:text-brand underline cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Notify Requests */}
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h3 className="font-display text-xl text-brand-soft">Out of Stock & Launch Alerts</h3>
                    <p className="text-xs text-muted-foreground">Customer notification requests</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("notify")}
                    className="text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1"
                  >
                    View All ({pendingNotifyRequests} pending) <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-4 divide-y divide-border">
                  {notifyRequests.slice(0, 4).map((req) => (
                    <div key={req.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] ${
                              req.type === "out_of_stock"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {req.type === "out_of_stock" ? "Restock Request" : "Coming Soon"}
                          </span>
                          <span
                            className={`text-[10px] font-medium ${
                              req.status === "Notified" ? "text-emerald-600" : "text-amber-600"
                            }`}
                          >
                            ● {req.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-foreground truncate">{req.sareeName}</p>
                        <p className="text-xs text-muted-foreground truncate">{req.customerEmail}</p>
                      </div>

                      {req.status === "Pending" ? (
                        <button
                          type="button"
                          onClick={() => {
                            updateNotifyStatus(req.id, "Notified");
                            showToast(`Marked notification request for ${req.customerEmail} as Notified!`);
                          }}
                          className="shrink-0 rounded-full bg-brand px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-foreground hover:bg-brand-soft cursor-pointer"
                        >
                          Mark Notified
                        </button>
                      ) : (
                        <span className="shrink-0 text-xs text-emerald-600 font-medium">✓ Notified</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeTab === "orders" && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">Filter:</span>
                {["all", "pending", "processing", "completed", "cancelled"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setOrderFilter(st)}
                    className={`rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] cursor-pointer ${
                      orderFilter === st
                        ? "bg-brand text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[240px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search order ID or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-border bg-background pl-9 pr-4 py-1.5 text-xs outline-none focus:border-gold"
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-xs">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-sm text-muted-foreground">
                        No orders match the current filter or search query.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-xs text-foreground">{order.id}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-foreground">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.email}</p>
                          <p className="text-xs text-muted-foreground">{order.phone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-foreground">{order.items.length} saree(s)</span>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {order.items.map((i) => i.name).join(", ")}
                          </p>
                        </td>
                        <td className="px-6 py-4 font-display font-semibold text-brand-soft tabular-nums">
                          {formatPrice(order.total)}
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">{order.date}</td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => {
                              updateOrderStatus(order.id, e.target.value as OrderStatus);
                              showToast(`Order ${order.id} status updated to ${e.target.value}!`);
                            }}
                            className={`rounded-full px-3 py-1 text-xs font-semibold outline-none cursor-pointer ${
                              order.status === "Pending"
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : order.status === "Processing"
                                ? "bg-blue-100 text-blue-900 border border-blue-300"
                                : order.status === "Completed"
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                : "bg-red-100 text-red-900 border border-red-300"
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-gold hover:text-brand cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS & STOCK MANAGEMENT */}
        {activeTab === "products" && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">Status:</span>
                {[
                  { id: "all", label: `All (${totalProductsCount})` },
                  { id: "in_stock", label: `In Stock (${inStockProductsCount})` },
                  { id: "out_of_stock", label: `Out of Stock (${outOfStockProductsCount})` },
                  { id: "coming_soon", label: `Coming Soon (${comingSoonProductsCount})` },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setProductFilter(st.id)}
                    className={`rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] cursor-pointer ${
                      productFilter === st.id
                        ? "bg-brand text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="relative min-w-[200px]">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border border-border bg-background pl-9 pr-4 py-1.5 text-xs outline-none focus:border-gold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(true)}
                  className="rounded-full bg-gold px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-soft hover:bg-gold-soft flex items-center gap-1.5 cursor-pointer shadow-md transition-transform active:scale-95 font-bold"
                >
                  <Plus className="h-4 w-4" /> + Add Saree Product
                </button>
              </div>
            </div>

            {/* Products Grid / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p, index) => {
                const isDragging = draggedIndex === index;
                const isTarget = dragOverIndex === index;

                return (
                  <div
                    key={p.slug}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`group relative flex flex-col justify-between rounded-3xl border bg-card p-5 shadow-xs transition-all cursor-grab active:cursor-grabbing ${
                      isDragging
                        ? "opacity-40 border-dashed border-gold scale-95"
                        : isTarget
                        ? "ring-4 ring-gold/60 scale-[1.02] border-brand shadow-lg"
                        : "border-border hover:border-gold/50"
                    }`}
                  >
                    <div>
                      {/* DRAG HANDLE BAR */}
                      <div className="mb-3 flex items-center justify-between text-[11px] font-semibold text-muted-foreground bg-secondary/80 px-3 py-1.5 rounded-xl border border-border/60">
                        <span className="flex items-center gap-1.5 text-brand font-bold">
                          <GripVertical className="h-4 w-4 text-gold" /> Drag to Arrange
                        </span>
                        <span className="font-mono text-[10px] font-bold text-slate-700 bg-background px-2.5 py-0.5 rounded-md border border-border shadow-2xs">
                          Order #{index + 1}
                        </span>
                      </div>

                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-secondary shadow-xs">
                      <img
                        src={getPublicUrl(p.image)}
                        alt={p.name}
                        className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <span className="absolute left-3 top-3 glass-panel rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-soft">
                        {p.weave}
                      </span>
                      {p.status === "out_of_stock" && (
                        <span className="absolute right-3 top-3 rounded-full bg-destructive/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-destructive-foreground">
                          Out of Stock
                        </span>
                      )}
                      {p.status === "coming_soon" && (
                        <span className="absolute right-3 top-3 rounded-full bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-soft gold-frame">
                          Coming Soon
                        </span>
                      )}
                      {p.status === "in_stock" && (
                        <span className="absolute right-3 top-3 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                          In Stock
                        </span>
                      )}
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-lg font-semibold text-brand-soft">{p.name}</h3>
                        <span className="font-display text-base font-semibold tabular-nums">{formatPrice(p.price)}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        {p.blouseAvailability && p.blouseAvailability !== "none" && (
                          <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {p.blouseAvailability === "with_only"
                              ? "✂️ With Attached Blouse Only"
                              : p.blouseAvailability === "without_only"
                              ? "🧵 Extra Blouse Piece Only"
                              : "✂️ Both Options Available"}
                          </span>
                        )}
                        {p.withoutBlouseDiscount && p.withoutBlouseDiscount > 0 ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            -₹{p.withoutBlouseDiscount} Without Blouse
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{p.blurb}</p>


                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                        <span className="inline-flex items-center gap-1 font-medium text-foreground">
                          <ShoppingCart className="h-3.5 w-3.5 text-purple-600" /> {p.cartAddsCount} Cart Adds
                        </span>
                        <span>Published: {p.publishedAt || "Active"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Status Selector & Action buttons */}
                  <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Status:</span>
                      <select
                        value={p.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as ProductStatus;
                          updateProductStatus(p.slug, newStatus);
                          showToast(`Updated "${p.name}" status to ${newStatus.replace("_", " ")}!`);
                        }}
                        className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold outline-none focus:border-gold cursor-pointer"
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="coming_soon">Coming Soon</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1">
                      <Link
                        to="/shop/$slug"
                        params={{ slug: p.slug }}
                        target="_blank"
                        className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-brand"
                        title="View product on site"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setEditingProduct(p)}
                        className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-brand cursor-pointer"
                        title="Edit Product Details"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteProduct(p.slug);
                          showToast(`Product "${p.name}" deleted.`);
                        }}
                        className="rounded-full p-2 text-muted-foreground hover:bg-red-50 hover:text-destructive cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}

        {/* TAB 4: RESTOCK & COMING SOON NOTIFY REQUESTS */}
        {activeTab === "notify" && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">Filter:</span>
                {[
                  { id: "all", label: `All (${totalNotifyRequests})` },
                  { id: "pending", label: `Pending (${pendingNotifyRequests})` },
                  { id: "notified", label: "Notified" },
                  { id: "out_of_stock", label: `Restock Alerts (${outOfStockRequestsCount})` },
                  { id: "coming_soon", label: `Launch Alerts (${comingSoonRequestsCount})` },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setNotifyFilter(st.id)}
                    className={`rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] cursor-pointer ${
                      notifyFilter === st.id
                        ? "bg-brand text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[240px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search email or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-border bg-background pl-9 pr-4 py-1.5 text-xs outline-none focus:border-gold"
                />
              </div>
            </div>

            {/* Notify Requests List Table */}
            <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-xs">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Request ID</th>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Request Type</th>
                    <th className="px-6 py-4">Customer Contact</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredNotifyRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-sm text-muted-foreground">
                        No notification requests found for this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredNotifyRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-xs text-foreground">{req.id}</td>
                        <td className="px-6 py-4 font-medium text-brand-soft">{req.sareeName}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                              req.type === "out_of_stock"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {req.type === "out_of_stock" ? "Out of Stock Restock" : "Coming Soon Launch"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {req.customerEmail}
                          </div>
                          {req.customerPhone && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {req.customerPhone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">{req.date}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              req.status === "Notified"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {req.status === "Notified" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {req.status === "Pending" ? (
                              <button
                                type="button"
                                onClick={() => {
                                  updateNotifyStatus(req.id, "Notified");
                                  showToast(`Restock alert email simulated & sent to ${req.customerEmail}!`);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-foreground hover:bg-brand-soft cursor-pointer shadow-xs"
                              >
                                <Send className="h-3 w-3" /> Send Alert & Mark
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => updateNotifyStatus(req.id, "Pending")}
                                className="text-xs text-muted-foreground hover:text-brand underline cursor-pointer"
                              >
                                Reset to Pending
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                deleteNotifyRequest(req.id);
                                showToast(`Deleted request ${req.id}`);
                              }}
                              className="rounded-full p-1.5 text-muted-foreground hover:bg-red-50 hover:text-destructive cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: CART ANALYTICS */}
        {activeTab === "cart_analytics" && (
          <div className="mt-8 space-y-8">
            <div className="rounded-3xl border border-border bg-card p-6">
              <h3 className="font-display text-2xl text-brand-soft">Cart Addition Metrics</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Detailed metrics of sarees added to customer carts, indicating high buying intent.
              </p>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4">Saree Name</th>
                      <th className="px-6 py-4">Weave</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Stock Status</th>
                      <th className="px-6 py-4">Total Cart Additions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[...products]
                      .sort((a, b) => b.cartAddsCount - a.cartAddsCount)
                      .map((p) => (
                        <tr key={p.slug} className="hover:bg-muted/30">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <img src={getPublicUrl(p.image)} alt={p.name} className="h-10 w-10 rounded-lg object-cover bg-secondary" />
                            <span className="font-medium text-foreground">{p.name}</span>
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-gold">{p.weave}</td>
                          <td className="px-6 py-4 font-display font-semibold tabular-nums">{formatPrice(p.price)}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                                p.status === "in_stock"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : p.status === "out_of_stock"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {p.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-brand-soft tabular-nums">
                            {p.cartAddsCount} times
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: AUTOMATED CUSTOMER EMAILS CONTROL CENTER */}
        {activeTab === "emails" && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Automated Email Dispatch System
                </span>
                <h2 className="mt-2 font-display text-2xl text-brand-soft">Customer Email Automation Center</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Customize your brand thank-you greetings, email templates, and audit dispatched customer receipts.
                </p>
              </div>

              {/* Sub Navigation Tabs */}
              <div className="flex items-center gap-2 rounded-full border border-border bg-background p-1.5">
                <button
                  type="button"
                  onClick={() => setActiveEmailSubTab("editor")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] cursor-pointer transition-all ${
                    activeEmailSubTab === "editor"
                      ? "bg-brand text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Template Editor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEmailSubTab("logs")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] cursor-pointer transition-all ${
                    activeEmailSubTab === "logs"
                      ? "bg-brand text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Dispatched Logs ({getSentEmailLogs().length})
                </button>
              </div>
            </div>

            {/* SUB-VIEW 1: EMAIL TEMPLATE EDITOR */}
            {activeEmailSubTab === "editor" && (
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-brand-soft">Automated Email Template Settings</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Configure the official thank-you greeting and booking receipt content sent from <strong className="text-emerald-800">{emailConfig.senderEmail}</strong>.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowEmailPreview(true)}
                      className="rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground hover:border-gold hover:text-brand cursor-pointer whitespace-nowrap"
                    >
                      <Eye className="h-4 w-4 inline mr-1" /> Live Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailConfig(DEFAULT_EMAIL_TEMPLATE);
                        saveEmailTemplateConfig(DEFAULT_EMAIL_TEMPLATE);
                        showToast("Restored email template to default brand layout!");
                      }}
                      className="rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:bg-muted cursor-pointer whitespace-nowrap"
                    >
                      Reset Default
                    </button>
                  </div>
                </div>

                {/* Dynamic Variables Guide Chips */}
                <div className="rounded-2xl bg-cream/70 p-4 border border-gold/20 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Available Dynamic Placeholders:</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {[
                      { code: "{ORDER_ID}", desc: "Booking Order ID (e.g. #ORD-8492)" },
                      { code: "{CUSTOMER_NAME}", desc: "Customer Full Name" },
                      { code: "{PHONE}", desc: "Customer Phone Number" },
                      { code: "{EMAIL}", desc: "Customer Email Address" },
                      { code: "{ADDRESS}", desc: "Customer Delivery Address" },
                    ].map((v) => (
                      <span
                        key={v.code}
                        className="inline-flex items-center gap-1 rounded-lg bg-background px-2.5 py-1 font-mono text-[11px] font-bold text-brand-soft border border-gold/30 shadow-2xs"
                        title={v.desc}
                      >
                        {v.code}
                      </span>
                    ))}
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveEmailTemplateConfig(emailConfig);
                    showToast("Automated customer email template saved successfully!");
                  }}
                  className="space-y-6"
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                        Brand Sender Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={emailConfig.senderEmail}
                        onChange={(e) => setEmailConfig({ ...emailConfig, senderEmail: e.target.value })}
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                        Brand Sender Display Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={emailConfig.senderName}
                        onChange={(e) => setEmailConfig({ ...emailConfig, senderName: e.target.value })}
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  {/* Google Apps Script Web App URL Config */}
                  <div className="rounded-2xl border border-emerald-600/30 bg-emerald-500/10 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-950 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-emerald-700" /> Google Apps Script Automated Mail URL:
                      </label>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-500/20 px-2.5 py-0.5 rounded-full">
                        kadha.shop@gmail.com Direct Gmail Dispatch
                      </span>
                    </div>
                    <input
                      type="url"
                      placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                      value={emailConfig.googleScriptUrl || ""}
                      onChange={(e) => setEmailConfig({ ...emailConfig, googleScriptUrl: e.target.value })}
                      className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-mono outline-none focus:border-gold"
                    />
                    <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                      💡 Paste your published Google Apps Script Web App URL above to send automated emails directly from <strong>kadha.shop@gmail.com</strong>.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                      Email Subject Line Template *
                    </label>
                    <input
                      type="text"
                      required
                      value={emailConfig.subjectTemplate}
                      onChange={(e) => setEmailConfig({ ...emailConfig, subjectTemplate: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                      Warm Thank You Greeting Message *
                    </label>
                    <input
                      type="text"
                      required
                      value={emailConfig.greetingText}
                      onChange={(e) => setEmailConfig({ ...emailConfig, greetingText: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                      Order Booking Received Confirmation Text *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={emailConfig.thankYouMessage}
                      onChange={(e) => setEmailConfig({ ...emailConfig, thankYouMessage: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm leading-relaxed outline-none focus:border-gold"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      ✓ Changes to this template take effect immediately on all future customer bookings.
                    </p>
                    <button
                      type="submit"
                      className="rounded-full bg-brand px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground hover:bg-brand-soft shadow-md cursor-pointer whitespace-nowrap"
                    >
                      Save Email Template
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SUB-VIEW 2: DISPATCHED EMAILS LOG TABLE */}
            {activeEmailSubTab === "logs" && (
              <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-xs">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4">Log ID</th>
                      <th className="px-6 py-4">Sender Email</th>
                      <th className="px-6 py-4">Booking ID</th>
                      <th className="px-6 py-4">Recipient Customer</th>
                      <th className="px-6 py-4">Email Subject</th>
                      <th className="px-6 py-4">Dispatched At</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {getSentEmailLogs().length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-muted-foreground">
                          No automated emails dispatched yet. Book an order on the store to test automated customer email generation.
                        </td>
                      </tr>
                    ) : (
                      getSentEmailLogs().map((emailLog) => (
                        <tr key={emailLog.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-xs text-gold">{emailLog.id}</td>
                          <td className="px-6 py-4 font-mono text-xs font-semibold text-emerald-800">
                            {emailLog.senderEmail || emailConfig.senderEmail}
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-xs text-brand-soft">{emailLog.orderId}</td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-foreground">{emailLog.customerName}</p>
                            <p className="text-xs text-muted-foreground">{emailLog.recipientEmail}</p>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-foreground max-w-[280px] truncate">
                            {emailLog.subject}
                          </td>
                          <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">{emailLog.sentAt}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                              ✓ {emailLog.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      {/* MODAL: LIVE EMAIL HTML PREVIEW */}
      {showEmailPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-gold/40 bg-background text-foreground shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4 shrink-0">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gold" />
                <h3 className="font-display text-xl font-medium text-brand-soft">Live Customer Email Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailPreview(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-muted/40">
              <iframe
                title="Email Preview"
                srcDoc={generateOrderEmailHtml(
                  {
                    id: "ORD-8492",
                    customerName: "Ananya Roy",
                    email: "ananya.roy@example.com",
                    phone: "+91 98765 43210",
                    address: "Flat 4B, Emerald Heights, MG Road, Kochi, Kerala - 682016",
                    items: [
                      { slug: "turmeric-zari-brocade", name: "Turmeric Zari Brocade", qty: 2, price: 6200, image: "" },
                      { slug: "sunrise-stripe-cotton", name: "Sunrise Stripe Cotton", qty: 1, price: 2200, image: "" },
                    ],
                    total: 14600,
                    date: "Today",
                    status: "Pending",
                  },
                  emailConfig
                )}
                className="w-full h-[580px] rounded-2xl border border-border bg-white shadow-inner"
              />
            </div>

            <div className="flex justify-end border-t border-border bg-card px-6 py-4 shrink-0">
              <button
                type="button"
                onClick={() => setShowEmailPreview(false)}
                className="rounded-full bg-brand px-6 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground hover:bg-brand-soft cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* MODAL: ADD NEW PRODUCT */}
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onAddProduct={(productData) => {
          addProduct(productData);
          setActiveTab("products");
        }}
        onShowToast={showToast}
        existingSlugs={products.map((p) => p.slug)}
      />

      {/* MODAL: EDIT PRODUCT */}
      <EditProductModal
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onUpdateProduct={(slug, fields) => {
          updateProduct(slug, fields);
          showToast(`Updated product details.`);
        }}
        onShowToast={showToast}
      />

      {/* MODAL: ORDER DETAILS (RESPONSIVE LANDSCAPE WHITE THEME) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-gold/40 bg-background text-foreground shadow-2xl overflow-hidden">
            {/* Sticky Top Header Bar */}
            <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4 sm:px-8 shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
                  {selectedOrder.id}
                </span>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-medium text-brand-soft">Order Details</h3>
                  <p className="text-xs text-muted-foreground">Received on {selectedOrder.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    updateOrderStatus(selectedOrder.id, e.target.value as OrderStatus);
                    showToast(`Order ${selectedOrder.id} status updated to ${e.target.value}!`);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold outline-none cursor-pointer ${
                    selectedOrder.status === "Pending"
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : selectedOrder.status === "Processing"
                      ? "bg-blue-100 text-blue-900 border border-blue-300"
                      : selectedOrder.status === "Completed"
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      : "bg-red-100 text-red-900 border border-red-300"
                  }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  title="Close Window"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Landscape 2-Column Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left Column: Customer & Shipping Info (5 cols) */}
              <div className="md:col-span-5 space-y-5">
                <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <User className="h-4 w-4 text-gold" />
                    <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft">Customer Profile</h4>
                  </div>
                  <div>
                    <p className="font-display text-base font-semibold text-foreground">{selectedOrder.customerName}</p>
                    <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{selectedOrder.email}</span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>{selectedOrder.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <MapPin className="h-4 w-4 text-gold" />
                    <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft">Delivery Address</h4>
                  </div>
                  <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">{selectedOrder.address}</p>
                  {selectedOrder.notes && (
                    <div className="mt-3 rounded-xl bg-cream/70 p-3 border border-gold/20">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-gold">Customer Notes:</p>
                      <p className="mt-0.5 text-xs italic text-brand-soft">"{selectedOrder.notes}"</p>
                    </div>
                  )}
                </div>

                {/* Direct WhatsApp Contact Button */}
                <a
                  href={`https://wa.me/${selectedOrder.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${selectedOrder.customerName}, regarding your Kadha order ${selectedOrder.id}...`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-500/10 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800 transition-colors hover:bg-emerald-500/20 cursor-pointer whitespace-nowrap"
                >
                  <MessageSquare className="h-4 w-4 text-emerald-600" /> DM Customer on WhatsApp
                </a>
              </div>

              {/* Right Column: Scrollable Ordered Sarees List (7 cols) */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft flex items-center gap-2">
                    <Package className="h-4 w-4 text-gold" /> Ordered Sarees ({selectedOrder.items.length})
                  </h4>
                  <span className="text-xs font-semibold text-muted-foreground">Items Total</span>
                </div>

                <div className="max-h-[320px] overflow-y-auto space-y-3 pr-1 divide-y divide-border">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4 pt-3 first:pt-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={getPublicUrl(item.image)}
                          alt={item.name}
                          className="h-14 w-11 rounded-xl object-cover bg-secondary border border-border shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-display text-sm font-semibold text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Quantity: <span className="font-semibold text-foreground">{item.qty}</span> × {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                      <span className="font-display text-sm font-bold tabular-nums text-brand-soft whitespace-nowrap">
                        {formatPrice(item.price * item.qty)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Total Breakdown */}
                <div className="mt-4 rounded-2xl bg-cream p-4 border border-gold/20 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Shipping Fee</span>
                    <span className="font-semibold text-emerald-700 uppercase tracking-wider">Free (Kerala)</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-border/60 pt-2 text-sm font-bold text-foreground">
                    <span>Total Amount</span>
                    <span className="font-display text-xl text-brand-soft tabular-nums">
                      {formatPrice(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Bottom Footer Bar */}
            <div className="flex items-center justify-between border-t border-border bg-muted/40 px-6 py-4 sm:px-8 shrink-0">
              <div className="text-xs text-muted-foreground">
                Total Order Value: <strong className="font-display text-base text-brand-soft tabular-nums">{formatPrice(selectedOrder.total)}</strong>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-full bg-brand px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-brand-soft cursor-pointer whitespace-nowrap shadow-md"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-brand px-5 py-3 text-xs font-semibold text-primary-foreground shadow-2xl gold-frame animate-in slide-in-from-bottom-4">
          ✓ {toastMessage}
        </div>
      )}
    </div>
  );
}

// FAST CANVAS COMPRESSOR TO BLOB FOR SUPABASE STORAGE UPLOAD
function compressFileToBlob(file: File, maxWidth = 1000, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context failed"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Blob conversion failed"));
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Failed to load image for blob creation"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// UPLOADS IMAGE FILE TO SUPABASE STORAGE 'Product images' BUCKET AND RETURNS PUBLIC CDN URL
export async function uploadToSupabaseStorage(file: File): Promise<string> {
  if (!isSupabaseConfigured) {
    return compressImageFile(file, 800, 0.75);
  }

  try {
    const compressedBlob = await compressFileToBlob(file, 1000, 0.8);
    const fileName = `saree_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`;

    // Candidate bucket names matching the user's Supabase Storage dashboard bucket 'Product images'
    const bucketCandidates = [
      "Product images",
      "Product-images",
      "product-images",
      "product_images",
      "Product_images",
      "sarees",
      "products",
    ];

    for (const bucketName of bucketCandidates) {
      const { data, error } = await supabase.storage.from(bucketName).upload(fileName, compressedBlob, {
        contentType: "image/jpeg",
        upsert: true,
      });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(data.path);
        if (publicUrlData?.publicUrl) {
          console.log(`Successfully uploaded image to Supabase Storage bucket '${bucketName}':`, publicUrlData.publicUrl);
          return publicUrlData.publicUrl;
        }
      }
    }

    console.info("Supabase Storage bucket notice, using optimized Data URL fallback.");
    return compressImageFile(file, 800, 0.75);
  } catch (err) {
    console.warn("Supabase Storage exception, using Data URL fallback:", err);
    return compressImageFile(file, 800, 0.75);
  }
}

// FAST OFFSCREEN CANVAS IMAGE COMPRESSOR (Produces compact JPEG base64 strings ~40KB for ultra-fast localStorage saving)
function compressImageFile(file: File, maxWidth = 600, quality = 0.65): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// MINIMAL & MODERN ADD PRODUCT POPUP MODAL (LANDSCAPE WHITE THEME)
function AddProductModal({
  isOpen,
  onClose,
  onAddProduct,
  onShowToast,
  existingSlugs,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (productData: Omit<ExtendedSaree, "cartAddsCount">) => void;
  onShowToast: (msg: string) => void;
  existingSlugs: string[];
}) {
  const [name, setName] = useState("");
  const [weave, setWeave] = useState("Kanjivaram");
  const [colour, setColour] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [originalPrice, setOriginalPrice] = useState<number | "">("");
  const [status, setStatus] = useState<ProductStatus>("in_stock");

  // Cover Page & Gallery State
  const [image, setImage] = useState("");

  const [blurb, setBlurb] = useState("");
  const [fabric, setFabric] = useState("");
  const [blouse, setBlouse] = useState("");
  const [care, setCare] = useState("");

  // Additional Images State
  const [views, setViews] = useState<{ url: string; label: string }[]>([]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [hasAttachedBlouse, setHasAttachedBlouse] = useState(false);
  const [hasExtraBlouse, setHasExtraBlouse] = useState(false);
  const [withoutBlouseDiscount, setWithoutBlouseDiscount] = useState<number | "">(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setName("");
      setWeave("Kanjivaram");
      setColour("");
      setPrice("");
      setOriginalPrice("");
      setStatus("in_stock");
      setImage("");
      setViews([]);
      setBlurb("");
      setFabric("");
      setBlouse("");
      setCare("");
      setHasAttachedBlouse(false);
      setHasExtraBlouse(false);
      setWithoutBlouseDiscount(0);
      setErrorMessage(null);
      setIsCompressing(false);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);


  if (!isOpen) return null;

  // Upload Cover Page Image Handler (Uploads directly to Supabase Storage)
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const uploadedUrl = await uploadToSupabaseStorage(file);
      setImage(uploadedUrl);
      setViews((prev) => {
        if (prev.some((v) => v.url === uploadedUrl)) return prev;
        return [{ url: uploadedUrl, label: "Cover Page Image" }, ...prev];
      });
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsCompressing(false);
      e.target.value = "";
    }
  };

  // Upload Additional Images Handler (Supports Multiple File Selection to Supabase Storage)
  const handleAdditionalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsCompressing(true);
      const fileList = Array.from(files);
      const uploadedUrls = await Promise.all(
        fileList.map((file) => uploadToSupabaseStorage(file))
      );

      const newEntries = uploadedUrls.map((url, i) => ({
        url,
        label: `Featured Image ${views.length + i + 1}`,
      }));

      setViews((prev) => [...prev, ...newEntries]);
      if (!image && uploadedUrls.length > 0) {
        setImage(uploadedUrls[0]);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsCompressing(false);
      e.target.value = "";
    }
  };

  const handleSetAsCover = (url: string) => {
    setImage(url);
  };

  const handleDeleteView = (indexToDelete: number) => {
    const targetUrl = views[indexToDelete]?.url;
    const updated = views.filter((_, i) => i !== indexToDelete);
    setViews(updated);
    if (targetUrl === image) {
      setImage(updated.length > 0 ? updated[0].url : "");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter a valid saree product name.");
      return;
    }

    const numPrice = Number(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      setErrorMessage("Please enter a valid price greater than ₹0.");
      return;
    }

    const imageUrl = image || (views.length > 0 ? views[0].url : "");
    if (!imageUrl) {
      setErrorMessage("Please upload a cover photo for the saree product.");
      return;
    }

    let slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || `saree-${Date.now()}`;

    if (existingSlugs.includes(slug)) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const finalViews = views.length > 0 ? views : [{ url: imageUrl, label: "Cover Page Image" }];

    const derivedBlouseAvailability: BlouseAvailability =
      hasAttachedBlouse && hasExtraBlouse
        ? "both"
        : hasAttachedBlouse
        ? "with_only"
        : hasExtraBlouse
        ? "without_only"
        : "none";

    onAddProduct({
      slug,
      name: name.trim(),
      weave,
      colour: colour.trim() || "Multi",
      price: numPrice,
      originalPrice: Number(originalPrice) || undefined,
      status,
      stockQty: status === "in_stock" ? 1 : 0,
      image: imageUrl,
      views: finalViews,
      blurb: blurb.trim() || "Handcrafted handwoven saree.",
      fabric: fabric.trim() || "Handwoven pure fabric",
      blouse: blouse.trim() || "Blouse piece included",
      care: care.trim() || "Dry clean recommended for first wash.",
      blouseAvailability: derivedBlouseAvailability,
      withoutBlouseDiscount: Number(withoutBlouseDiscount) || 0,
    });

    onShowToast(`Saree "${name.trim()}" published successfully!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border-2 border-gold/40 bg-white text-slate-900 p-6 sm:p-8 shadow-2xl font-sans">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/20 text-gold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold">Studio Catalog</p>
              <h2 className="font-display text-2xl font-semibold text-brand-soft">Add New Saree Product</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: COVER PAGE IMAGE & ADDITIONAL IMAGES */}
          <div className="md:col-span-5 space-y-6 bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
            {/* SECTION 1: COVER PAGE IMAGE ADDING */}
            <div className="space-y-3 bg-white p-4 rounded-xl border border-gold/30 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase tracking-[0.18em] text-slate-800 font-bold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-gold shrink-0" />
                  <span>Cover Page Image</span>
                </label>
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Main Store Cover
                </span>
              </div>

              {/* Cover Image Preview or Dropzone */}
              {image ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border-2 border-gold/50 bg-slate-100 shadow-xs group">
                  <img src={getPublicUrl(image)} alt="Cover Page" className="h-full w-full object-cover" />
                  <span className="absolute top-2 left-2 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold text-brand-soft shadow-xs">
                    ★ Cover Page Image
                  </span>
                  {isCompressing && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-semibold">
                      Processing Image...
                    </div>
                  )}
                </div>
              ) : (
                <label className="relative flex aspect-[4/3] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100/80 cursor-pointer p-4 text-center transition-colors">
                  <UploadCloud className="h-8 w-8 text-gold mb-2" />
                  <span className="text-xs font-semibold text-slate-700">No cover image uploaded</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Click to browse & upload saree cover photo</span>
                  <input type="file" accept="image/*" onChange={handleCoverFileUpload} className="hidden" />
                </label>
              )}

              {/* Cover Image File Upload button */}
              {image && (
                <label className="w-full rounded-xl border border-gold/40 bg-gold/10 hover:bg-gold/20 py-2.5 px-4 flex items-center justify-center gap-2 cursor-pointer text-xs font-bold text-brand-soft transition-colors shadow-2xs whitespace-nowrap">
                  <UploadCloud className="h-4 w-4 text-gold shrink-0" />
                  <span className="whitespace-nowrap">Change Cover Photo</span>
                  <input type="file" accept="image/*" onChange={handleCoverFileUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* SECTION 2: ADDITIONAL IMAGES SECTION */}
            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase tracking-[0.18em] text-slate-800 font-bold flex items-center gap-1.5 whitespace-nowrap">
                  <ImageIcon className="h-4 w-4 text-brand shrink-0" />
                  <span className="whitespace-nowrap">Additional Images ({views.length})</span>
                </label>
              </div>

              {/* Additional Photo File Upload (Multiple Selection Enabled) */}
              <label className="w-full rounded-xl border border-slate-300 bg-white hover:bg-slate-100 py-2.5 px-4 flex items-center justify-center gap-2 cursor-pointer text-xs font-bold text-slate-700 transition-colors shadow-2xs whitespace-nowrap">
                <UploadCloud className="h-4 w-4 text-brand shrink-0" />
                <span className="whitespace-nowrap">+ Upload Additional Photos</span>
                <input type="file" accept="image/*" multiple onChange={handleAdditionalFileUpload} className="hidden" />
              </label>

              {/* Uploaded Additional Images Gallery */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 block whitespace-nowrap">
                  Uploaded Gallery Images:
                </span>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {views.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-2 whitespace-nowrap">No additional images added.</p>
                  ) : (
                    views.map((view, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all ${
                          view.url === image
                            ? "border-gold bg-gold/10 shadow-2xs"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <img
                          src={getPublicUrl(view.url)}
                          alt="Gallery item"
                          className="h-12 w-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                        />

                        <div className="flex-1 min-w-0">
                          {view.url === image ? (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block whitespace-nowrap">
                              ★ Cover Page Image
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetAsCover(view.url)}
                              className="text-[10px] text-brand hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                            >
                              ★ Set as Cover Page
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteView(idx)}
                          title="Remove Image"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DETAILS FORM FIELDS */}
          <div className="md:col-span-7 space-y-3.5">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1 font-bold">
                Saree Title / Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Emerald Kanjivaram Brocade"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-gold font-medium"
              />
            </div>

            {/* Stock Status & Pricing */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1 font-bold">
                  Stock Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProductStatus)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-gold cursor-pointer font-medium"
                >
                  <option value="in_stock">In Stock (Live)</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="coming_soon">Coming Soon</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-emerald-800 mb-1 font-bold">
                  Offer Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 4500 (Selling)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-xl border border-emerald-300 bg-emerald-50/40 px-3 py-2 text-xs text-slate-900 outline-none focus:border-gold font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-red-700 mb-1 font-bold">
                  Was Price / MRP (₹)
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 6000 (Crossed price)"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-xl border border-red-200 bg-red-50/30 px-3 py-2 text-xs text-slate-900 outline-none focus:border-gold font-medium"
                />
              </div>
            </div>

            {/* Weave & Colour */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1 font-bold">
                  Weave Type
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kanjivaram, Banarasi..."
                  value={weave}
                  onChange={(e) => setWeave(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-gold font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1 font-bold">
                  Primary Colour
                </label>
                <input
                  type="text"
                  placeholder="e.g. Emerald Green, Gold..."
                  value={colour}
                  onChange={(e) => setColour(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-gold font-medium"
                />
              </div>
            </div>

            {/* Blouse Options Checklist */}
            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-[10px] uppercase tracking-[0.18em] text-slate-800 font-bold">
                Blouse Options Checklist
              </label>

              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasAttachedBlouse}
                    onChange={(e) => setHasAttachedBlouse(e.target.checked)}
                    className="h-4 w-4 accent-amber-600 rounded border-slate-300"
                  />
                  <span>✂️ With Attached Blouse</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasExtraBlouse}
                    onChange={(e) => setHasExtraBlouse(e.target.checked)}
                    className="h-4 w-4 accent-amber-600 rounded border-slate-300"
                  />
                  <span>🧵 Extra Blouse Piece</span>
                </label>
              </div>

              {hasExtraBlouse && (
                <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-slate-600 font-bold shrink-0">Discount (₹):</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 500 (Deducted when bought without blouse)"
                    value={withoutBlouseDiscount}
                    onChange={(e) => setWithoutBlouseDiscount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-gold font-medium"
                  />
                </div>
              )}
            </div>

            {/* Short Story / Craft Blurb (Single Line Input) */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1 font-bold">
                Short Craft Description / Blurb
              </label>
              <input
                type="text"
                value={blurb}
                onChange={(e) => setBlurb(e.target.value)}
                placeholder="e.g. Handcrafted masterpiece woven with rich heritage zari craftsmanship."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-gold font-medium"
              />
            </div>

            {/* Action Bar */}
            <div className="pt-3 flex justify-end items-center gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-brand px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-brand-soft shadow-md cursor-pointer transition-transform active:scale-95 font-bold whitespace-nowrap"
              >
                Publish Saree Product
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// MINIMAL & MODERN EDIT PRODUCT POPUP MODAL (LANDSCAPE WHITE THEME)
function EditProductModal({
  product,
  onClose,
  onUpdateProduct,
  onShowToast,
}: {
  product: ExtendedSaree | null;
  onClose: () => void;
  onUpdateProduct: (slug: string, fields: Partial<ExtendedSaree>) => void;
  onShowToast: (msg: string) => void;
}) {
  const [name, setName] = useState("");
  const [weave, setWeave] = useState("Kanjivaram");
  const [colour, setColour] = useState("Gold");
  const [price, setPrice] = useState<number | "">(4500);
  const [originalPrice, setOriginalPrice] = useState<number | "">("");
  const [status, setStatus] = useState<ProductStatus>("in_stock");

  // Cover Page Image State
  const [image, setImage] = useState("");

  const [blurb, setBlurb] = useState("");
  const [fabric, setFabric] = useState("");
  const [blouse, setBlouse] = useState("");
  const [care, setCare] = useState("");

  // Additional Images State
  const [views, setViews] = useState<{ url: string; label: string }[]>([]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [hasAttachedBlouse, setHasAttachedBlouse] = useState(false);
  const [hasExtraBlouse, setHasExtraBlouse] = useState(false);
  const [withoutBlouseDiscount, setWithoutBlouseDiscount] = useState<number | "">(0);

  useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
      setName(product.name);
      setWeave(product.weave);
      setColour(product.colour);
      setPrice(product.price);
      setOriginalPrice(product.originalPrice || "");
      setStatus(product.status);
      setImage(product.image || getPublicUrl("Product/Beige%20Ikat%20Mulmul%20Saree.png"));
      setBlurb(product.blurb);
      setFabric(product.fabric);
      setBlouse(product.blouse);
      setCare(product.care);
      setHasAttachedBlouse(product.blouseAvailability === "both" || product.blouseAvailability === "with_only");
      setHasExtraBlouse(product.blouseAvailability === "both" || product.blouseAvailability === "without_only");
      setWithoutBlouseDiscount(product.withoutBlouseDiscount || 0);
      const initialViews =
        product.views && product.views.length > 0
          ? product.views
          : [{ url: product.image || getPublicUrl("Product/Beige%20Ikat%20Mulmul%20Saree.png"), label: "Cover Page Image" }];
      setViews(initialViews);
      setErrorMessage(null);
      setIsCompressing(false);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  if (!product) return null;

  // Upload Cover Page Image Handler (Uploads directly to Supabase Storage)
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const uploadedUrl = await uploadToSupabaseStorage(file);
      setImage(uploadedUrl);
      setViews((prev) => {
        if (prev.some((v) => v.url === uploadedUrl)) return prev;
        return [{ url: uploadedUrl, label: "Cover Page Image" }, ...prev];
      });
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsCompressing(false);
      e.target.value = "";
    }
  };

  // Upload Additional Images Handler (Supports Multiple File Selection to Supabase Storage)
  const handleAdditionalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsCompressing(true);
      const fileList = Array.from(files);
      const uploadedUrls = await Promise.all(
        fileList.map((file) => uploadToSupabaseStorage(file))
      );

      const newEntries = uploadedUrls.map((url, i) => ({
        url,
        label: `Featured Image ${views.length + i + 1}`,
      }));

      setViews((prev) => [...prev, ...newEntries]);
      if (!image && uploadedUrls.length > 0) {
        setImage(uploadedUrls[0]);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsCompressing(false);
      e.target.value = "";
    }
  };

  const handleSetAsCover = (url: string) => {
    setImage(url);
  };

  const handleDeleteView = (indexToDelete: number) => {
    const targetUrl = views[indexToDelete]?.url;
    const updated = views.filter((_, i) => i !== indexToDelete);
    setViews(updated);

    if (targetUrl === image && updated.length > 0) {
      setImage(updated[0].url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter a valid saree name.");
      return;
    }

    const numPrice = Number(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      setErrorMessage("Please enter a valid price greater than ₹0.");
      return;
    }

    const imageUrl = image || (views.length > 0 ? views[0].url : product.image);
    const finalViews = views.length > 0 ? views : [{ url: imageUrl, label: "Cover Page Image" }];

    const derivedBlouseAvailability: BlouseAvailability =
      hasAttachedBlouse && hasExtraBlouse
        ? "both"
        : hasAttachedBlouse
        ? "with_only"
        : hasExtraBlouse
        ? "without_only"
        : "none";

    onUpdateProduct(product.slug, {
      name: name.trim(),
      weave,
      colour: colour.trim(),
      price: numPrice,
      originalPrice: Number(originalPrice) || undefined,
      status,
      stockQty: status === "in_stock" ? 1 : 0,
      image: imageUrl,
      views: finalViews,
      blurb: blurb.trim(),
      fabric: fabric.trim(),
      blouse: blouse.trim(),
      care: care.trim(),
      blouseAvailability: derivedBlouseAvailability,
      withoutBlouseDiscount: Number(withoutBlouseDiscount) || 0,
    });

    onShowToast(`Product "${name.trim()}" updated successfully!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border-2 border-gold/40 bg-white text-slate-900 p-6 sm:p-8 shadow-2xl font-sans">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/20 text-gold">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold">Catalog Management</p>
              <h2 className="font-display text-2xl font-semibold text-brand-soft">Edit Saree Product</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: COVER PAGE IMAGE & ADDITIONAL IMAGES */}
          <div className="md:col-span-5 space-y-6 bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
            {/* SECTION 1: COVER PAGE IMAGE EDITING */}
            <div className="space-y-3 bg-white p-4 rounded-xl border border-gold/30 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase tracking-[0.18em] text-slate-800 font-bold flex items-center gap-1.5 whitespace-nowrap">
                  <Sparkles className="h-4 w-4 text-gold shrink-0" />
                  <span className="whitespace-nowrap">Cover Page Image</span>
                </label>
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Main Store Cover
                </span>
              </div>

              {/* Cover Image Preview */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border-2 border-gold/50 bg-slate-100 shadow-xs group">
                <img src={getPublicUrl(image)} alt="Cover Page" className="h-full w-full object-cover" />
                <span className="absolute top-2 left-2 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold text-brand-soft shadow-xs whitespace-nowrap">
                  ★ Cover Page Image
                </span>
                {isCompressing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-semibold whitespace-nowrap">
                    Processing Image...
                  </div>
                )}
              </div>

              {/* Cover Image File Upload */}
              <label className="w-full rounded-xl border border-gold/40 bg-gold/10 hover:bg-gold/20 py-2.5 px-4 flex items-center justify-center gap-2 cursor-pointer text-xs font-bold text-brand-soft transition-colors shadow-2xs whitespace-nowrap">
                <UploadCloud className="h-4 w-4 text-gold shrink-0" />
                <span className="whitespace-nowrap">Upload New Cover Photo</span>
                <input type="file" accept="image/*" onChange={handleCoverFileUpload} className="hidden" />
              </label>
            </div>

            {/* SECTION 2: ADDITIONAL IMAGES SECTION */}
            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase tracking-[0.18em] text-slate-800 font-bold flex items-center gap-1.5 whitespace-nowrap">
                  <ImageIcon className="h-4 w-4 text-brand shrink-0" />
                  <span className="whitespace-nowrap">Additional Images ({views.length})</span>
                </label>
              </div>

              {/* Additional Photo File Upload (Multiple Selection Enabled) */}
              <label className="w-full rounded-xl border border-slate-300 bg-white hover:bg-slate-100 py-2.5 px-4 flex items-center justify-center gap-2 cursor-pointer text-xs font-bold text-slate-700 transition-colors shadow-2xs whitespace-nowrap">
                <UploadCloud className="h-4 w-4 text-brand shrink-0" />
                <span className="whitespace-nowrap">+ Upload Additional Photos</span>
                <input type="file" accept="image/*" multiple onChange={handleAdditionalFileUpload} className="hidden" />
              </label>

              {/* Uploaded Additional Images Gallery */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 block whitespace-nowrap">
                  Uploaded Gallery Images:
                </span>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {views.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-2 whitespace-nowrap">No additional images added.</p>
                  ) : (
                    views.map((view, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all ${
                          view.url === image
                            ? "border-gold bg-gold/10 shadow-2xs"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <img
                          src={getPublicUrl(view.url)}
                          alt="Gallery item"
                          className="h-12 w-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                        />

                        <div className="flex-1 min-w-0">
                          {view.url === image ? (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block whitespace-nowrap">
                              ★ Cover Page Image
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetAsCover(view.url)}
                              className="text-[10px] text-brand hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                            >
                              ★ Set as Cover Page
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteView(idx)}
                          title="Remove Image"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DETAILS FORM FIELDS */}
          <div className="md:col-span-7 space-y-3.5">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1 font-bold">
                Saree Title / Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Emerald Kanjivaram Brocade"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-gold font-medium"
              />
            </div>

            {/* Stock Status & Pricing */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1 font-bold">
                  Stock Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProductStatus)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-gold cursor-pointer font-medium"
                >
                  <option value="in_stock">In Stock (Live)</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="coming_soon">Coming Soon</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-emerald-800 mb-1 font-bold">
                  Offer Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 4500 (Selling)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-xl border border-emerald-300 bg-emerald-50/40 px-3 py-2 text-xs text-slate-900 outline-none focus:border-gold font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-red-700 mb-1 font-bold">
                  Was Price / MRP (₹)
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 6000 (Crossed price)"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-xl border border-red-200 bg-red-50/30 px-3 py-2 text-xs text-slate-900 outline-none focus:border-gold font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1 font-bold">
                  Weave Type
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kanjivaram, Banarasi..."
                  value={weave}
                  onChange={(e) => setWeave(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-gold font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1 font-bold">
                  Primary Colour
                </label>
                <input
                  type="text"
                  placeholder="e.g. Emerald Green, Gold..."
                  value={colour}
                  onChange={(e) => setColour(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-gold font-medium"
                />
              </div>
            </div>

            {/* Blouse Options Checklist */}
            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-[10px] uppercase tracking-[0.18em] text-slate-800 font-bold">
                Blouse Options Checklist
              </label>

              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasAttachedBlouse}
                    onChange={(e) => setHasAttachedBlouse(e.target.checked)}
                    className="h-4 w-4 accent-amber-600 rounded border-slate-300"
                  />
                  <span>✂️ With Attached Blouse</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasExtraBlouse}
                    onChange={(e) => setHasExtraBlouse(e.target.checked)}
                    className="h-4 w-4 accent-amber-600 rounded border-slate-300"
                  />
                  <span>🧵 Extra Blouse Piece</span>
                </label>
              </div>

              {hasExtraBlouse && (
                <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-slate-600 font-bold shrink-0">Discount (₹):</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 500 (Deducted when bought without blouse)"
                    value={withoutBlouseDiscount}
                    onChange={(e) => setWithoutBlouseDiscount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-gold font-medium"
                  />
                </div>
              )}
            </div>

            {/* Short Story / Craft Blurb (Single Line Input) */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1 font-bold">
                Short Craft Description / Blurb
              </label>
              <input
                type="text"
                value={blurb}
                onChange={(e) => setBlurb(e.target.value)}
                placeholder="e.g. Handcrafted masterpiece woven with rich heritage zari craftsmanship."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-gold font-medium"
              />
            </div>

            <div className="pt-3 flex justify-end items-center gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-brand px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-brand-soft shadow-md cursor-pointer transition-transform active:scale-95 font-bold whitespace-nowrap"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

