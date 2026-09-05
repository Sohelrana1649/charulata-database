import { z } from "zod";

export const saveLeadSchema = z.object({
  body: z.object({
    name: z.string().max(100, "Name cannot exceed 100 characters").trim().optional().nullable().or(z.literal("")),
    phone: z.string().min(1, "Phone number is required").regex(/^(?:\+8801|8801|01)[3-9]\d{8}$/, "Must be a valid 11-digit Bangladeshi mobile number"),
    cartSnapshot: z.array(
      z.object({
        productId: z.string().optional().nullable(),
        name: z.string().optional().nullable().default("Product"),
        quantity: z.number().optional().nullable().default(1),
        price: z.number().optional().nullable().default(0),
        image: z.string().optional().nullable(),
        selectedColor: z.string().optional().nullable(),
        selectedSize: z.string().optional().nullable()
      })
    ).optional().nullable().default([]),
    cartTotal: z.number().optional().nullable().default(0)
  })
});

export const getLeadsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    converted: z.string().optional(),
    search: z.string().optional()
  }).optional()
});
