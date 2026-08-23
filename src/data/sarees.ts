export type SareeView = { url: string; label: string };

export type BlouseAvailability = "both" | "with_only" | "without_only" | "none";

export type Saree = {
  slug: string;
  name: string;
  weave: string;
  colour: string;
  price: number;
  originalPrice?: number;
  image: string;
  views: SareeView[];
  blurb: string;
  fabric: string;
  blouse: string;
  care: string;
  blouseAvailability?: BlouseAvailability;
  withoutBlouseDiscount?: number;
};

const views = (flat: string, model: string, detail: string): SareeView[] => [
  { url: flat, label: "Full drape" },
  { url: model, label: "On the model" },
  { url: detail, label: "Weave detail" },
];

import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import heroBanner from "@/assets/hero-banner.jpg";
import weaver from "@/assets/weaver.jpg";

import { getPublicUrl } from "@/lib/utils";

export const sarees: Saree[] = [
  {
    slug: "beige-ikat-mulmul-saree",
    name: "Beige Ikat Mulmul Saree",
    weave: "Mulmul Cotton",
    colour: "Beige",
    price: 2999,
    originalPrice: 3499,
    image: getPublicUrl("Product/Beige%20Ikat%20Mulmul%20Saree.png"),
    views: [{ url: getPublicUrl("Product/Beige%20Ikat%20Mulmul%20Saree.png"), label: "Full drape" }],
    blurb: "Handwoven Beige Ikat Mulmul Cotton Saree.",
    fabric: "Pure Mulmul Cotton",
    blouse: "Unstitched blouse piece included",
    care: "Gentle hand wash or dry clean.",
    blouseAvailability: "both",
    withoutBlouseDiscount: 300,
  },
  {
    slug: "coffee-brown-sungudi-cotton-saree",
    name: "Coffee Brown Sungudi Cotton Saree",
    weave: "Sungudi Cotton",
    colour: "Coffee Brown",
    price: 3199,
    originalPrice: 3699,
    image: getPublicUrl("Product/Coffee%20Brown%20Sungudi%20Cotton%20Saree.png"),
    views: [{ url: getPublicUrl("Product/Coffee%20Brown%20Sungudi%20Cotton%20Saree.png"), label: "Full drape" }],
    blurb: "Handwoven Coffee Brown Sungudi Cotton Saree.",
    fabric: "Pure Sungudi Cotton",
    blouse: "Unstitched blouse piece included",
    care: "Gentle hand wash or dry clean.",
    blouseAvailability: "both",
    withoutBlouseDiscount: 300,
  },
  {
    slug: "multicolor-mulmul-cotton-saree",
    name: "Multicolor Mulmul Cotton Saree",
    weave: "Mulmul Cotton",
    colour: "Multicolor",
    price: 2899,
    originalPrice: 3399,
    image: getPublicUrl("Product/Multicolor%20Mulmul%20Cotton%20Saree.png"),
    views: [{ url: getPublicUrl("Product/Multicolor%20Mulmul%20Cotton%20Saree.png"), label: "Full drape" }],
    blurb: "Vibrant Multicolor Mulmul Cotton Saree.",
    fabric: "Pure Mulmul Cotton",
    blouse: "Unstitched blouse piece included",
    care: "Gentle hand wash or dry clean.",
    blouseAvailability: "both",
    withoutBlouseDiscount: 300,
  },
  {
    slug: "mustard-yellow-sungudi-cotton-saree",
    name: "Mustard Yellow Sungudi Cotton Saree",
    weave: "Sungudi Cotton",
    colour: "Mustard Yellow",
    price: 3299,
    originalPrice: 3799,
    image: getPublicUrl("Product/Mustard%20Yellow%20Sungudi%20Cotton%20Saree.png"),
    views: [{ url: getPublicUrl("Product/Mustard%20Yellow%20Sungudi%20Cotton%20Saree.png"), label: "Full drape" }],
    blurb: "Traditional Mustard Yellow Sungudi Cotton Saree.",
    fabric: "Pure Sungudi Cotton",
    blouse: "Unstitched blouse piece included",
    care: "Gentle hand wash or dry clean.",
    blouseAvailability: "both",
    withoutBlouseDiscount: 300,
  },
  {
    slug: "orange-sungudi-cotton-saree",
    name: "Orange Sungudi Cotton Saree",
    weave: "Sungudi Cotton",
    colour: "Orange",
    price: 3199,
    originalPrice: 3699,
    image: getPublicUrl("Product/Orange%20Sungudi%20Cotton%20Saree.png"),
    views: [{ url: getPublicUrl("Product/Orange%20Sungudi%20Cotton%20Saree.png"), label: "Full drape" }],
    blurb: "Handwoven Orange Sungudi Cotton Saree.",
    fabric: "Pure Sungudi Cotton",
    blouse: "Unstitched blouse piece included",
    care: "Gentle hand wash or dry clean.",
    blouseAvailability: "both",
    withoutBlouseDiscount: 300,
  },
  {
    slug: "red-sungudi-saree",
    name: "Red Sungudi Saree",
    weave: "Sungudi Cotton",
    colour: "Red",
    price: 3399,
    originalPrice: 3899,
    image: getPublicUrl("Product/Red%20Sungudi%20Saree.png"),
    views: [{ url: getPublicUrl("Product/Red%20Sungudi%20Saree.png"), label: "Full drape" }],
    blurb: "Classic Red Sungudi Cotton Saree.",
    fabric: "Pure Sungudi Cotton",
    blouse: "Unstitched blouse piece included",
    care: "Gentle hand wash or dry clean.",
    blouseAvailability: "both",
    withoutBlouseDiscount: 300,
  },
  {
    slug: "white-ikat-mulmul-saree",
    name: "White Ikat Mulmul Saree",
    weave: "Mulmul Cotton",
    colour: "White",
    price: 2999,
    originalPrice: 3499,
    image: getPublicUrl("Product/White%20Ikat%20Mulmul%20Saree.png"),
    views: [{ url: getPublicUrl("Product/White%20Ikat%20Mulmul%20Saree.png"), label: "Full drape" }],
    blurb: "Ethereal White Ikat Mulmul Cotton Saree.",
    fabric: "Pure Mulmul Cotton",
    blouse: "Unstitched blouse piece included",
    care: "Gentle hand wash or dry clean.",
    blouseAvailability: "both",
    withoutBlouseDiscount: 300,
  },
  {
    slug: "yellow-teal-mulmul-cotton-saree",
    name: "Yellow Teal Mulmul Cotton Saree",
    weave: "Mulmul Cotton",
    colour: "Yellow & Teal",
    price: 3099,
    originalPrice: 3599,
    image: getPublicUrl("Product/Yellow%20Teal%20Mulmul%20Cotton%20Saree.png"),
    views: [{ url: getPublicUrl("Product/Yellow%20Teal%20Mulmul%20Cotton%20Saree.png"), label: "Full drape" }],
    blurb: "Elegant Yellow and Teal Mulmul Cotton Saree.",
    fabric: "Pure Mulmul Cotton",
    blouse: "Unstitched blouse piece included",
    care: "Gentle hand wash or dry clean.",
    blouseAvailability: "both",
    withoutBlouseDiscount: 300,
  },
];

export const weaves = [
  "Mulmul Cotton",
  "Sungudi Cotton",
  "Kanjivaram",
  "Banarasi",
  "Chanderi",
  "Chettinad",
  "Ikat",
  "Cotton",
];

export const getSaree = (slug: string): Saree | undefined => {
  if (typeof window !== "undefined") {
    try {
      const activeRaw = localStorage.getItem("kadha_admin_products_v40");
      if (activeRaw) {
        const stored: Saree[] = JSON.parse(activeRaw);
        const match = stored.find((s) => s.slug === slug);
        if (match) {
          return {
            ...match,
            image: getPublicUrl(match.image),
            views: (match.views || []).map((v) => ({ ...v, url: getPublicUrl(v.url) })),
          };
        }
      }

      for (let i = 39; i >= 1; i--) {
        const raw = localStorage.getItem(`kadha_admin_products_v${i}`);
        if (raw) {
          const stored: Saree[] = JSON.parse(raw);
          const match = stored.find((s) => s.slug === slug);
          if (match) {
            return {
              ...match,
              image: getPublicUrl(match.image),
              views: (match.views || []).map((v) => ({ ...v, url: getPublicUrl(v.url) })),
            };
          }
        }
      }
    } catch {}
  }
  const match = sarees.find((s) => s.slug === slug);
  if (!match) return undefined;
  return {
    ...match,
    image: getPublicUrl(match.image),
    views: (match.views || []).map((v) => ({ ...v, url: getPublicUrl(v.url) })),
  };
};

export const formatPrice = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise);
