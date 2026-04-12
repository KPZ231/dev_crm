import { z } from "zod";
import { TaskStatus, TaskPriority } from "@prisma/client";

export const taskSchema = z.object({
  title: z.string().min(3, "Tytuł musi mieć co najmniej 3 znaki"),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  assigneeId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  dueDate: z.date().optional().nullable(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

export const commentSchema = z.object({
  content: z.string().min(1, "Komentarz nie może być pusty"),
});

export type CommentFormValues = z.infer<typeof commentSchema>;
