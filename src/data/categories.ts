import type { L } from "@/i18n/config";

export const categoryIds = ["pantry", "crafts", "hearth", "body", "gifts"] as const;
export type CategoryId = (typeof categoryIds)[number];

export type Category = {
  id: CategoryId;
  name: L;
  blurb: L;
  image: string;
};

export const categories: Category[] = [
  {
    id: "pantry",
    name: { en: "The Pantry", ar: "المؤونة" },
    blurb: {
      en: "Hibiscus, sesame, egusi and the spices of the West African kitchen.",
      ar: "الكركديه والسمسم والإيغوسي وبهارات مطبخ غرب أفريقيا.",
    },
    image: "/images/products/hibiscus-3.jpg",
  },
  {
    id: "crafts",
    name: { en: "Arts & Crafts", ar: "الفنون والحِرف" },
    blurb: {
      en: "Indigo cloth, Kano leather, Bida beads and lost-wax bronze.",
      ar: "قماش نيلي وجلود كانو وخرز بيدا وبرونز مصبوب بالشمع.",
    },
    image: "/images/editorial/masks-market.jpg",
  },
  {
    id: "hearth",
    name: { en: "Hearth & Charcoal", ar: "الفحم والشواء" },
    blurb: {
      en: "Dense Nigerian hardwood charcoal for the grill and the majlis.",
      ar: "فحم نيجيري كثيف من الخشب الصلب للشواء والمجلس.",
    },
    image: "/images/editorial/embers.jpg",
  },
  {
    id: "body",
    name: { en: "Body & Wellness", ar: "العناية الطبيعية" },
    blurb: {
      en: "Raw shea butter and black soap, made the traditional way.",
      ar: "زبدة شيا خام وصابون أسود، يُصنعان بالطريقة التقليدية.",
    },
    image: "/images/products/shea-2.jpg",
  },
  {
    id: "gifts",
    name: { en: "Gift Sets", ar: "الهدايا" },
    blurb: {
      en: "Ready-to-give boxes for Ramadan, Eid and every majlis.",
      ar: "صناديق جاهزة للإهداء في رمضان والعيد ولكل مجلس.",
    },
    image: "/images/products/hibiscus-2.jpg",
  },
];

export function isCategoryId(value: string): value is CategoryId {
  return (categoryIds as readonly string[]).includes(value);
}

export function getCategory(id: CategoryId): Category {
  return categories.find((c) => c.id === id)!;
}
