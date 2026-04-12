import { z } from "zod";

export const revenueFilterSchema = z.object({
  period: z.enum(["monthly", "quarterly", "yearly"]).default("monthly"),
  year: z.number().int().min(2000).max(2100).default(new Date().getFullYear()),
});

export const invoiceFilterSchema = z.object({
  status: z.string().optional(),
  clientId: z.string().optional(),
  search: z.string().optional(),
});
