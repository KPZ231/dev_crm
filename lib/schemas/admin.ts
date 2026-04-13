import { z } from "zod";
import { WorkspaceRole } from "@prisma/client";

export const inviteSchema = z.object({
  email: z.string().email("Niepoprawny adres e-mail"),
  role: z.nativeEnum(WorkspaceRole, {
    message: "Nieprawidłowa rola",
  }),
});

export type InviteFormValues = z.infer<typeof inviteSchema>;

export const memberUpdateSchema = z.object({
  role: z.nativeEnum(WorkspaceRole, {
    message: "Nieprawidłowa rola",
  }),
});

export type MemberUpdateValues = z.infer<typeof memberUpdateSchema>;
