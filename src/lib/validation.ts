import { z } from "zod";
import { deliveryMethods } from "./delivery";
import { MAX_QTY_PER_LINE } from "./pricing";

// Error messages are dictionary keys under checkout.errors, so the form can
// show them in the customer's language.

const required = (max: number) => z.string().trim().min(1, "required").max(max);
const digits = (max: number) =>
  z.string().trim().min(1, "required").max(max).regex(/^\d+$/, "number");

export const checkoutSchema = z.object({
  locale: z.enum(["en", "ar"]),
  items: z
    .array(
      z.object({
        slug: z.string().max(100),
        variant: z.string().max(50),
        qty: z.number().int().min(1).max(MAX_QTY_PER_LINE),
      }),
    )
    .min(1, "emptyCart")
    .max(50),
  customer: z.object({
    firstName: required(60),
    lastName: required(60),
    email: z.string().trim().min(1, "required").max(200).pipe(z.email("email")),
    // Qatar numbers are 8 digits. Accept spaces and a +974/00974 prefix, store 8 digits.
    phone: z
      .string()
      .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+|00)?974/, ""))
      .pipe(z.string().regex(/^[2-7]\d{7}$/, "phone")),
  }),
  address: z.object({
    city: required(40),
    zone: digits(3),
    street: digits(4),
    building: digits(4),
    unit: z.string().trim().max(20).optional().default(""),
    notes: z.string().trim().max(500).optional().default(""),
  }),
  deliveryMethod: z.enum(deliveryMethods),
  paymentMethod: z.enum(["card", "cod"]).default("card"),
  discountCode: z.string().trim().max(40).optional().default(""),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const newsletterSchema = z.object({
  email: z.string().trim().max(200).pipe(z.email()),
  locale: z.enum(["en", "ar"]),
});

export const discountCheckSchema = z.object({
  code: z.string().trim().min(1).max(40),
  items: checkoutSchema.shape.items,
});

export const reviewSchema = z.object({
  orderId: z.string().max(40),
  token: z.string().max(80),
  locale: z.enum(["en", "ar"]),
  name: z.string().trim().min(1, "required").max(40),
  reviews: z
    .array(
      z.object({
        slug: z.string().max(100),
        rating: z.number().int().min(1).max(5),
        body: z.string().trim().min(3, "required").max(1500),
        photo: z.string().url().max(500).optional().nullable(),
      }),
    )
    .min(1)
    .max(20),
});
