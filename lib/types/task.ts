import { Task, TaskStatus, TaskPriority, User, Project, TaskComment, TaskActivity } from "@prisma/client";

export type TaskWithRelations = Task & {
  assignee?: Pick<User, "id" | "name" | "email" | "image"> | null;
  creator?: Pick<User, "id" | "name" | "email">;
  project?: Pick<Project, "id" | "name"> | null;
  comments?: (TaskComment & { user: Pick<User, "id" | "name" | "image"> })[];
  activities?: (TaskActivity & { user: Pick<User, "id" | "name"> })[];
};

export interface KanbanColumnData {
  id: TaskStatus;
  tasks: TaskWithRelations[];
}

export type KanbanData = Record<TaskStatus, TaskWithRelations[]>;

export interface WorkloadPoint {
  userId: string;
  userName: string;
  userImage?: string | null;
  taskCount: number;
  highPriorityCount: number;
  totalPoints?: number; // Estimated complexity if we had it
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  projectId?: string;
  search?: string;
}
