import { z } from "zod";
import { CostCategory, CostType } from "@prisma/client";

export const costSchema = z.object({
  name: z.string().min(2, "Nazwa musi mieć co najmniej 2 znaki"),
  category: z.nativeEnum(CostCategory),
  type: z.nativeEnum(CostType).default(CostType.VARIABLE),
  amount: z.number().positive("Kwota musi być dodatnia"),
  projectId: z.string().optional().nullable(),
  isRecurring: z.boolean().default(false),
  date: z.date().default(() => new Date()),
  notes: z.string().optional().nullable(),
});

export type CostFormValues = z.infer<typeof costSchema>;
