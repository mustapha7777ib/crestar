import { z } from "zod";
import { categoryIds } from "@/data/categories";
import { towns } from "@/data/towns";

const text = (max: number) => z.string().trim().max(max);
const bilingual = (max: number, required = true) =>
  z.object({ en: required ? text(max).min(1, "Required") : text(max), ar: required ? text(max).min(1, "Required") : text(max) });

export const productFormSchema = z.object({
  originalSlug: z.string().nullable(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lower-case letters, numbers and dashes only"),
  category: z.enum(categoryIds),
  town: z.enum(Object.keys(towns) as [keyof typeof towns, ...(keyof typeof towns)[]]),
  active: z.boolean(),
  handmade: z.boolean(),
  featured: z.number().int().min(1).max(99).nullable(),
  name: bilingual(120),
  tagline: bilingual(160),
  story: bilingual(3000),
  badge: bilingual(40, false),
  images: z.array(z.string().min(1).max(500)).min(1, "Add at least one photo").max(12),
  details: z.array(z.object({ label: bilingual(60), value: bilingual(300) })).max(12),
  bundle: z.array(z.string()).max(12),
  variants: z
    .array(
      z.object({
        code: z
          .string()
          .trim()
          .min(1)
          .max(30)
          .regex(/^[a-zA-Z0-9-]+$/, "Letters, numbers and dashes only"),
        label: bilingual(60),
        price: z.number().int().min(0).max(10_000_000), // dirhams
        stock: z.number().int().min(0).max(100_000).nullable(),
        weight: z.number().int().min(0).max(1_000_000), // grams
      }),
    )
    .min(1, "Add at least one size")
    .max(12)
    .refine((v) => new Set(v.map((x) => x.code)).size === v.length, "Each size needs its own code"),
});

export type ProductForm = z.infer<typeof productFormSchema>;
