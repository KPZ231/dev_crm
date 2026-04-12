import { z } from "zod";
import { ClientStatus, PaymentStatus } from "@prisma/client";

const nipRegex = /^\d{10}$/;

export const clientSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  nip: z.string().regex(nipRegex, "NIP must be exactly 10 digits").optional().or(z.literal("")),
  address: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  contactPerson: z.string().min(2, "Contact person name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  industry: z.string().optional(),
  status: z.nativeEnum(ClientStatus).default(ClientStatus.ACTIVE),
  paymentStatus: z.nativeEnum(PaymentStatus).default(PaymentStatus.UP_TO_DATE),
  contractedSince: z.date().optional(),
  notes: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

export const clientUpdateSchema = clientSchema.partial();
