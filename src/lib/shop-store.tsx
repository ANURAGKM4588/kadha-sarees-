import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { sarees as defaultSarees, type Saree } from "@/data/sarees";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { resolveAssetUrl } from "@/lib/utils";

export type ProductStatus = "in_stock" | "out_of_stock" | "coming_soon";

export type ExtendedSaree = Saree & {
  status: ProductStatus;
  cartAddsCount: number;
  stockQty: number;
  publishedAt?: string;
};

export type OrderStatus = "Pending" | "Processing" | "Completed" | "Cancelled";

export type OrderItem = {
  slug: string;
  name: string;
  qty: number;
  price: number;
  image: string;
  blouseOption?: "with" | "without";
};


export type Order = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  items: OrderItem[];
  total: number;
  date: string;
  status: OrderStatus;
  paymentId?: string;
  paymentStatus?: "Paid" | "Pending" | "Failed";
};

export type NotifyRequestType = "out_of_stock" | "coming_soon";
export type NotifyRequestStatus = "Pending" | "Notified";

export type NotifyRequest = {
  id: string;
  sareeSlug: string;
  sareeName: string;
  customerEmail: string;
  customerPhone?: string;
  type: NotifyRequestType;
  date: string;
  status: NotifyRequestStatus;
};

type ShopStoreContextType = {
  products: ExtendedSaree[];
  orders: Order[];
  notifyRequests: NotifyRequest[];
  updateProductStatus: (slug: string, status: ProductStatus) => void;
  addProduct: (product: Omit<ExtendedSaree, "cartAddsCount"> & { cartAddsCount?: number }) => void;
  updateProduct: (slug: string, fields: Partial<ExtendedSaree>) => void;
  deleteProduct: (slug: string) => void;
  reorderProducts: (newProducts: ExtendedSaree[]) => void;
  incrementCartAdds: (slug: string, qty?: number) => void;
  createOrder: (orderData: Omit<Order, "id" | "date" | "status">) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  createNotifyRequest: (reqData: Omit<NotifyRequest, "id" | "date" | "status">) => NotifyRequest;
  updateNotifyStatus: (reqId: string, status: NotifyRequestStatus) => void;
  deleteNotifyRequest: (reqId: string) => void;
  resetStore: () => void;
};

const PRODUCTS_KEY = "kadha_admin_products_v55";
const ORDERS_KEY = "kadha_admin_orders_v3";
const NOTIFY_KEY = "kadha_admin_notify_v3";

const initialProducts: ExtendedSaree[] = defaultSarees.map((s) => ({
  ...s,
  status: "in_stock",
  cartAddsCount: 0,
  stockQty: 1,
}));

const initialOrders: Order[] = [];

const initialNotifyRequests: NotifyRequest[] = [];

const ShopStoreContext = createContext<ShopStoreContextType | null>(null);

function sanitizeProducts(prods: any[]): ExtendedSaree[] {
  if (!Array.isArray(prods) || prods.length === 0) return initialProducts;
  return prods
    .filter(Boolean)
    .map((p) => {
      const defaultMatch = defaultSarees.find(
        (ds) => ds.slug === p.slug || ds.name.toLowerCase() === String(p.name).toLowerCase()
      );

      let cleanImage = p.image;
      if (
        !cleanImage ||
        cleanImage.includes("Favicon.png") ||
        cleanImage.includes("hero-") ||
        cleanImage.includes("turmeric") ||
        cleanImage.includes("%2520")
      ) {
        cleanImage = defaultMatch?.image || "Product/Beige Ikat Mulmul Saree.png";
      }
      cleanImage = resolveAssetUrl(cleanImage);

      let updatedViews = Array.isArray(p.views) && p.views.length > 0 ? p.views : null;
      if (
        !updatedViews ||
        updatedViews.some(
          (v: any) => !v.url || v.url.includes("Favicon.png") || v.url.includes("%2520")
        )
      ) {
        updatedViews = defaultMatch?.views || [{ url: cleanImage, label: "Full drape" }];
      } else {
        updatedViews = updatedViews.map((v: any) => ({
          ...v,
          url: resolveAssetUrl(v.url),
        }));
      }

      return {
        slug: String(p.slug || defaultMatch?.slug || `saree-${Math.random().toString().slice(2, 6)}`),
        name: String(p.name || defaultMatch?.name || "Handwoven Saree"),
        weave: String(p.weave || defaultMatch?.weave || "Mulmul Cotton"),
        colour: String(p.colour || defaultMatch?.colour || "Multi"),
        price: Number(p.price) || defaultMatch?.price || 2999,
        originalPrice: p.original_price
          ? Number(p.original_price)
          : p.originalPrice
          ? Number(p.originalPrice)
          : defaultMatch?.originalPrice,
        status: p.status || "in_stock",
        stockQty: p.stock_qty ?? p.stockQty ?? 1,
        cartAddsCount: p.cart_adds_count ?? p.cartAddsCount ?? 0,
        image: cleanImage,
        views: updatedViews,
        blurb: p.blurb || defaultMatch?.blurb || "",
        fabric: p.fabric || defaultMatch?.fabric || "",
        blouse: p.blouse || defaultMatch?.blouse || "",
        care: p.care || defaultMatch?.care || "",
        blouseAvailability:
          p.blouse_availability || p.blouseAvailability || defaultMatch?.blouseAvailability || "both",
        withoutBlouseDiscount:
          p.without_blouse_discount ?? p.withoutBlouseDiscount ?? defaultMatch?.withoutBlouseDiscount ?? 300,
        publishedAt: p.published_at || p.publishedAt,
      };
    });
}




function sanitizeOrders(dbOrders: any[]): Order[] {
  if (!Array.isArray(dbOrders) || dbOrders.length === 0) return initialOrders;
  return dbOrders.map((o) => {
    let itemsParsed = [];
    if (Array.isArray(o.items)) {
      itemsParsed = o.items;
    } else if (typeof o.items === "string") {
      try {
        itemsParsed = JSON.parse(o.items);
      } catch {
        itemsParsed = [];
      }
    }
    return {
      id: o.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: o.customer_name || o.customerName || "Customer",
      email: o.email || "",
      phone: o.phone || "",
      address: o.address || "",
      notes: o.notes || undefined,
      items: itemsParsed,
      total: Number(o.total) || 0,
      date: o.date ? String(o.date) : new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
      status: (o.status as OrderStatus) || "Pending",
      paymentId: o.payment_id || o.paymentId || undefined,
      paymentStatus: o.payment_status || o.paymentId || undefined,
    };
  });
}

function loadInitialProducts(): ExtendedSaree[] {
  if (typeof window === "undefined") return initialProducts;
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sanitizeProducts(parsed);
      }
    }
  } catch { }
  return initialProducts;
}

export function ShopStoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<ExtendedSaree[]>(loadInitialProducts);

  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window === "undefined") return initialOrders;
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      const parsed = raw ? JSON.parse(raw) : initialOrders;
      return sanitizeOrders(parsed);
    } catch {
      return initialOrders;
    }
  });

  const [notifyRequests, setNotifyRequests] = useState<NotifyRequest[]>(() => {
    if (typeof window === "undefined") return initialNotifyRequests;
    try {
      const raw = localStorage.getItem(NOTIFY_KEY);
      return raw ? JSON.parse(raw) : initialNotifyRequests;
    } catch {
      return initialNotifyRequests;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    } catch { }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch { }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFY_KEY, JSON.stringify(notifyRequests));
    } catch { }
  }, [notifyRequests]);

  // Sync from Supabase on mount and subscribe to Realtime updates if configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    async function syncSupabaseData() {
      try {
        const { data: dbProducts, error: dbErr } = await supabase.from("products").select("*");
        if (!dbErr && Array.isArray(dbProducts) && dbProducts.length > 0) {
          const sanitized = sanitizeProducts(dbProducts);
          setProducts(sanitized);

          // Auto-heal any legacy or un-prefixed image rows in Supabase database
          dbProducts.forEach((row) => {
            if (row.image && (row.image.startsWith("/") || row.image.includes("%2520") || row.image.includes("Favicon.png"))) {
              const match = sanitized.find((s) => s.slug === row.slug);
              if (match) {
                supabase.from("products").update({
                  image: match.image,
                  views: match.views,
                }).eq("slug", row.slug).then();
              }
            }
          });
        } else if (!dbErr && Array.isArray(dbProducts) && dbProducts.length === 0) {
          const localProds = loadInitialProducts();
          if (localProds.length > 0) {
            localProds.forEach((item) => {
              supabase.from("products").upsert({
                slug: item.slug,
                name: item.name,
                weave: item.weave,
                colour: item.colour,
                price: item.price,
                original_price: item.originalPrice,
                status: item.status,
                stock_qty: item.stockQty,
                image: item.image,
                views: item.views,
                blurb: item.blurb,
                fabric: item.fabric,
                blouse: item.blouse,
                care: item.care,
                blouse_availability: item.blouseAvailability,
                without_blouse_discount: item.withoutBlouseDiscount,
                cart_adds_count: item.cartAddsCount,
                published_at: item.publishedAt,
              }).then();
            });
          }
        }

        const { data: dbOrders } = await supabase.from("orders").select("*");
        if (dbOrders && dbOrders.length > 0) {
          setOrders(sanitizeOrders(dbOrders));
        }

        const { data: dbNotify } = await supabase.from("notify_requests").select("*");
        if (dbNotify && dbNotify.length > 0) {
          setNotifyRequests(dbNotify);
        }
      } catch (err) {
        console.warn("Supabase sync warning:", err);
      }
    }

    syncSupabaseData();

    // Supabase Realtime Channel: Live synchronization across GitHub Pages and Admin Panel
    const productsChannel = supabase
      .channel("realtime:products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, async () => {
        const { data: latest } = await supabase.from("products").select("*");
        if (latest && Array.isArray(latest) && latest.length > 0) {
          setProducts(sanitizeProducts(latest));
        }
      })
      .subscribe();

    const ordersChannel = supabase
      .channel("realtime:orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, async () => {
        const { data: latest } = await supabase.from("orders").select("*");
        if (latest && Array.isArray(latest)) {
          setOrders(sanitizeOrders(latest));
        }
      })
      .subscribe();

    const notifyChannel = supabase
      .channel("realtime:notify_requests")
      .on("postgres_changes", { event: "*", schema: "public", table: "notify_requests" }, async () => {
        const { data: latest } = await supabase.from("notify_requests").select("*");
        if (latest && Array.isArray(latest)) {
          setNotifyRequests(latest);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(notifyChannel);
    };
  }, []);

  const updateProductStatus = useCallback((slug: string, status: ProductStatus) => {
    setProducts((prev) =>
      prev.map((p) => (p.slug === slug ? { ...p, status, stockQty: status === "in_stock" ? Math.max(1, p.stockQty) : 0 } : p))
    );
    if (isSupabaseConfigured) {
      supabase.from("products").update({ status, stock_qty: status === "in_stock" ? 1 : 0 }).eq("slug", slug).then();
    }
  }, []);

  const addProduct = useCallback((newProduct: Omit<ExtendedSaree, "cartAddsCount"> & { cartAddsCount?: number }) => {
    const item: ExtendedSaree = {
      ...newProduct,
      cartAddsCount: newProduct.cartAddsCount ?? 0,
      publishedAt: newProduct.publishedAt || new Date().toISOString().split("T")[0],
    };
    setProducts((prev) => [item, ...prev]);
    if (isSupabaseConfigured) {
      supabase.from("products").upsert({
        slug: item.slug,
        name: item.name,
        weave: item.weave,
        colour: item.colour,
        price: item.price,
        original_price: item.originalPrice,
        status: item.status,
        stock_qty: item.stockQty,
        image: item.image,
        views: item.views,
        blurb: item.blurb,
        fabric: item.fabric,
        blouse: item.blouse,
        care: item.care,
        blouse_availability: item.blouseAvailability,
        without_blouse_discount: item.withoutBlouseDiscount,
        cart_adds_count: item.cartAddsCount,
        published_at: item.publishedAt,
      }).then(({ error }) => {
        if (error) console.warn("Supabase addProduct error:", error.message);
      });
    }
  }, []);

  const updateProduct = useCallback((slug: string, fields: Partial<ExtendedSaree>) => {
    setProducts((prev) => prev.map((p) => (p.slug === slug ? { ...p, ...fields } : p)));
    if (isSupabaseConfigured) {
      const dbPayload: Record<string, any> = {};
      if (fields.name !== undefined) dbPayload.name = fields.name;
      if (fields.weave !== undefined) dbPayload.weave = fields.weave;
      if (fields.colour !== undefined) dbPayload.colour = fields.colour;
      if (fields.price !== undefined) dbPayload.price = fields.price;
      if (fields.originalPrice !== undefined) dbPayload.original_price = fields.originalPrice;
      if (fields.status !== undefined) dbPayload.status = fields.status;
      if (fields.stockQty !== undefined) dbPayload.stock_qty = fields.stockQty;
      if (fields.image !== undefined) dbPayload.image = fields.image;
      if (fields.views !== undefined) dbPayload.views = fields.views;
      if (fields.blurb !== undefined) dbPayload.blurb = fields.blurb;
      if (fields.fabric !== undefined) dbPayload.fabric = fields.fabric;
      if (fields.blouse !== undefined) dbPayload.blouse = fields.blouse;
      if (fields.care !== undefined) dbPayload.care = fields.care;
      if (fields.blouseAvailability !== undefined) dbPayload.blouse_availability = fields.blouseAvailability;
      if (fields.withoutBlouseDiscount !== undefined) dbPayload.without_blouse_discount = fields.withoutBlouseDiscount;

      supabase.from("products").update(dbPayload).eq("slug", slug).then(({ error }) => {
        if (error) console.warn("Supabase update error:", error.message);
      });
    }
  }, []);

  const deleteProduct = useCallback((slug: string) => {
    setProducts((prev) => prev.filter((p) => p.slug !== slug));
    if (isSupabaseConfigured) {
      supabase.from("products").delete().eq("slug", slug).then();
    }
  }, []);

  const reorderProducts = useCallback((newProducts: ExtendedSaree[]) => {
    setProducts(newProducts);
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(newProducts));
    } catch {}
  }, []);

  const incrementCartAdds = useCallback((slug: string, qty: number = 1) => {
    setProducts((prev) =>
      prev.map((p) => (p.slug === slug ? { ...p, cartAddsCount: (p.cartAddsCount || 0) + qty } : p))
    );
  }, []);

  const createOrder = useCallback((orderData: Partial<Order> & Omit<Order, "id" | "date">): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
      status: orderData.status || "Pending",
    };
    setOrders((prev) => [newOrder, ...prev]);
    if (isSupabaseConfigured) {
      supabase
        .from("orders")
        .insert({
          id: newOrder.id,
          customer_name: newOrder.customerName,
          phone: newOrder.phone,
          email: newOrder.email,
          address: newOrder.address,
          notes: newOrder.notes,
          items: newOrder.items,
          total: newOrder.total,
          status: newOrder.status,
          date: newOrder.date,
          payment_id: newOrder.paymentId,
          payment_status: newOrder.paymentStatus,
        })
        .then(({ error }) => {
          if (error) console.warn("Supabase order insert warning:", error.message);
        });
    }
    return newOrder;
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    if (isSupabaseConfigured) {
      supabase.from("orders").update({ status }).eq("id", orderId).then();
    }
  }, []);

  const createNotifyRequest = useCallback(
    (reqData: Omit<NotifyRequest, "id" | "date" | "status">): NotifyRequest => {
      const newReq: NotifyRequest = {
        ...reqData,
        id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
        status: "Pending",
      };
      setNotifyRequests((prev) => [newReq, ...prev]);
      if (isSupabaseConfigured) {
        supabase.from("notify_requests").insert({
          id: newReq.id,
          saree_name: newReq.sareeName,
          saree_slug: newReq.sareeSlug,
          phone: newReq.phone,
          status: newReq.status,
          requested_at: newReq.date,
        }).then();
      }
      return newReq;
    },
    []
  );

  const updateNotifyStatus = useCallback((reqId: string, status: NotifyRequestStatus) => {
    setNotifyRequests((prev) => prev.map((r) => (r.id === reqId ? { ...r, status } : r)));
    if (isSupabaseConfigured) {
      supabase.from("notify_requests").update({ status }).eq("id", reqId).then();
    }
  }, []);

  const deleteNotifyRequest = useCallback((reqId: string) => {
    setNotifyRequests((prev) => prev.filter((r) => r.id !== reqId));
    if (isSupabaseConfigured) {
      supabase.from("notify_requests").delete().eq("id", reqId).then();
    }
  }, []);

  const resetStore = useCallback(() => {
    setProducts([]);
    setOrders([]);
    setNotifyRequests([]);
    for (let i = 1; i <= 10; i++) {
      localStorage.removeItem(`kadha_admin_products_v${i}`);
    }
    localStorage.removeItem(PRODUCTS_KEY);
    localStorage.removeItem(ORDERS_KEY);
    localStorage.removeItem(NOTIFY_KEY);
    if (isSupabaseConfigured) {
      supabase.from("products").delete().neq("slug", "").then();
    }
  }, []);

  const value = useMemo(
    () => ({
      products,
      orders,
      notifyRequests,
      updateProductStatus,
      addProduct,
      updateProduct,
      deleteProduct,
      reorderProducts,
      incrementCartAdds,
      createOrder,
      updateOrderStatus,
      createNotifyRequest,
      updateNotifyStatus,
      deleteNotifyRequest,
      resetStore,
    }),
    [
      products,
      orders,
      notifyRequests,
      updateProductStatus,
      addProduct,
      updateProduct,
      deleteProduct,
      reorderProducts,
      incrementCartAdds,
      createOrder,
      updateOrderStatus,
      createNotifyRequest,
      updateNotifyStatus,
      deleteNotifyRequest,
      resetStore,
    ]
  );

  return <ShopStoreContext.Provider value={value}>{children}</ShopStoreContext.Provider>;
}

export function useShopStore() {
  const ctx = useContext(ShopStoreContext);
  if (!ctx) throw new Error("useShopStore must be used within ShopStoreProvider");
  return ctx;
}
