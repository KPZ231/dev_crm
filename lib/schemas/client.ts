import { z } from "zod";
import { ClientStatus, PaymentStatus } from "@prisma/client";

const nipRegex = /^\d{10}$/;

export const clientSchema = z.object({
  companyName: z.string().min(2, "Nazwa firmy musi mieć co najmniej 2 znaki"),
  nip: z.string().regex(nipRegex, "NIP musi składać się z 10 cyfr").optional().or(z.literal("")).nullable().transform(v => v === "" ? null : v),
  address: z.string().optional().nullable().transform(v => v === "" ? null : v),
  website: z.string().url("Niepoprawny URL").optional().or(z.literal("")).nullable().transform(v => v === "" ? null : v),
  contactPerson: z.string().min(2, "Osoba kontaktowa musi mieć co najmniej 2 znaki"),
  email: z.string().email("Niepoprawny adres email").optional().or(z.literal("")).nullable().transform(v => v === "" ? null : v),
  phone: z.string().optional().nullable().transform(v => v === "" ? null : v),
  industry: z.string().optional().nullable().transform(v => v === "" ? null : v),
  status: z.nativeEnum(ClientStatus),
  paymentStatus: z.nativeEnum(PaymentStatus),
  contractedSince: z.coerce.date().optional().nullable(),
  notes: z.string().optional().nullable().transform(v => v === "" ? null : v),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

export const clientUpdateSchema = clientSchema.partial();
