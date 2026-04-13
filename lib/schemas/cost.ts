import { z } from "zod";
import { CostCategory, CostType } from "@prisma/client";

export const costSchema = z.object({
  name: z.string().min(2, "Nazwa musi mieć co najmniej 2 znaki"),
  category: z.nativeEnum(CostCategory),
  type: z.nativeEnum(CostType),
  amount: z.number().positive("Kwota musi być dodatnia"),
  projectId: z.string().nullable().transform(val => val === "" ? null : val),
  isRecurring: z.boolean(),
  date: z.date(),
  notes: z.string().nullable(),
});

export type CostFormValues = z.infer<typeof costSchema>;
