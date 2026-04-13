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

export const invoiceSchema = z.object({
  clientId: z.string().min(1, "Klient jest wymagany"),
  number: z.string().min(1, "Numer faktury jest wymagany"),
  amount: z.number().positive("Kwota musi być większa od zera"),
  dueDate: z.date({
    message: "Termin płatności jest wymagany",
  }),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
