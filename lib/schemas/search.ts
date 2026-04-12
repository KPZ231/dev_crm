import { z } from "zod";

export const searchRequestSchema = z.object({
  query: z.string().min(2, "Fraza musi mieć co najmniej 2 znaki"),
  limit: z.number().min(1).max(50).default(10),
});

export type SearchRequest = z.infer<typeof searchRequestSchema>;
