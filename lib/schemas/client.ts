import { z } from "zod";
import { ClientStatus, PaymentStatus } from "@prisma/client";

const nipRegex = /^\d{10}$/;

export const clientSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  nip: z.string().regex(nipRegex, "NIP must be exactly 10 digits").nullable(),
  address: z.string().nullable(),
  website: z.string().url("Invalid URL").nullable().or(z.literal("")),
  contactPerson: z.string().min(2, "Contact person name must be at least 2 characters"),
  email: z.string().email("Invalid email address").nullable().or(z.literal("")),
  phone: z.string().nullable(),
  industry: z.string().nullable(),
  status: z.nativeEnum(ClientStatus),
  paymentStatus: z.nativeEnum(PaymentStatus),
  contractedSince: z.date().nullable(),
  notes: z.string().nullable(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

export const clientUpdateSchema = clientSchema.partial();
