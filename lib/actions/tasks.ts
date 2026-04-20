"use server";

import { prisma } from "@/lib/prisma";
import { requireWorkspacePermission } from "@/core/access/workspace";
import { TaskWithRelations, KanbanData, TaskFilters, WorkloadPoint } from "@/lib/types/task";
import { taskSchema, commentSchema, TaskFormValues } from "@/lib/schemas/task";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getTaskFormOptions(workspaceId: string) {
  await requireWorkspacePermission(workspaceId, "read", "task");

  const [projects, members] = await Promise.all([
    prisma.project.findMany({
      where: { workspaceId },
      select: { id: true, name: true }
    }),
    prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    })
  ]);

  return { projects, members };
}

export async function getTasks(workspaceId: string, filters?: TaskFilters): Promise<TaskWithRelations[]> {
  await requireWorkspacePermission(workspaceId, "read", "task");

  const { status, priority, assigneeId, projectId, search } = filters || {};

  return await prisma.task.findMany({
    where: {
      workspaceId,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assigneeId && { assigneeId }),
      ...(projectId && { projectId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } }
        ]
      })
    },
    include: {
      assignee: { select: { id: true, name: true, email: true, image: true } },
      project: { select: { id: true, name: true } }
    },
    orderBy: { position: "asc" }
  });
}

export async function getKanbanBoard(workspaceId: string): Promise<KanbanData> {
  await requireWorkspacePermission(workspaceId, "read", "task");

  const tasks = await prisma.task.findMany({
    where: { workspaceId },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      project: { select: { id: true, name: true } }
    },
    orderBy: { position: "asc" }
  });

  const board: KanbanData = {
    BACKLOG: [],
    TODO: [],
    IN_PROGRESS: [],
    REVIEW: [],
    BLOCKED: [],
    DONE: []
  };

  tasks.forEach(task => {
    board[task.status].push(task as TaskWithRelations);
  });

  return board;
}

export async function createTask(workspaceId: string, data: TaskFormValues) {
  const { user } = await requireWorkspacePermission(workspaceId, "create", "task");
  
  const validated = taskSchema.parse(data);

  // Get max position for the status to append to the end
  const lastTask = await prisma.task.findFirst({
    where: { workspaceId, status: validated.status },
    orderBy: { position: "desc" }
  });

  const position = lastTask ? lastTask.position + 1000 : 1000;

  const task = await prisma.task.create({
    data: {
      ...validated,
      workspaceId,
      creatorId: user.id,
      position
    }
  });

  await logTaskActivity(task.id, user.id, "CREATED", null, task.status);

  revalidatePath("/dashboard/tasks");
  return task;
}

export async function moveTask(workspaceId: string, taskId: string, newStatus: TaskStatus, newPosition: number) {
  const { user, role } = await requireWorkspacePermission(workspaceId, "update", "task");

  const task = await prisma.task.findUnique({ where: { id: taskId, workspaceId } });
  if (!task) throw new Error("Task not found");

  // RBAC check for DEVELOPER: can only move their own tasks or assigned tasks
  if (role === "DEVELOPER" && task.assigneeId !== user.id && task.creatorId !== user.id) {
    throw new Error("You can only move your own tasks.");
  }

  const oldStatus = task.status;
  
  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus, position: newPosition }
  });

  if (oldStatus !== newStatus) {
    await logTaskActivity(taskId, user.id, "STATUS_CHANGE", oldStatus, newStatus);
  }

  revalidatePath("/dashboard/tasks");
  return updatedTask;
}

export async function updateTask(workspaceId: string, taskId: string, data: TaskFormValues) {
  const { user, role } = await requireWorkspacePermission(workspaceId, "update", "task");
  
  const validated = taskSchema.parse(data);

  const existingTask = await prisma.task.findUnique({ where: { id: taskId, workspaceId } });
  if (!existingTask) throw new Error("Task not found");

  if (role === "DEVELOPER" && existingTask.assigneeId !== user.id && existingTask.creatorId !== user.id) {
    throw new Error("You can only edit your own tasks.");
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: validated
  });

  await logTaskActivity(taskId, user.id, "UPDATED", null, null);

  revalidatePath("/dashboard/tasks");
  return updatedTask;
}

export async function addTaskComment(workspaceId: string, taskId: string, content: string) {
  const { user } = await requireWorkspacePermission(workspaceId, "read", "task");

  const comment = await prisma.taskComment.create({
    data: {
      taskId,
      userId: user.id,
      content
    },
    include: {
        user: { select: { id: true, name: true, image: true } }
    }
  });

  revalidatePath(`/tasks/${taskId}`);
  return comment;
}

export async function getWorkload(workspaceId: string): Promise<WorkloadPoint[]> {
    await requireWorkspacePermission(workspaceId, "read", "task");

    const activeTasks = await prisma.task.findMany({
        where: { 
            workspaceId, 
            status: { not: "DONE" } 
        },
        include: {
            assignee: { select: { id: true, name: true, image: true } }
        }
    });

    const members = await prisma.workspaceMember.findMany({
        where: { workspaceId },
        include: { user: { select: { id: true, name: true, image: true } } }
    });

    return members.map(member => {
        const userTasks = activeTasks.filter(t => t.assigneeId === member.userId);
        return {
            userId: member.userId,
            userName: member.user.name || "Unknown",
            userImage: member.user.image,
            taskCount: userTasks.length,
            highPriorityCount: userTasks.filter(t => t.priority === "HIGH" || t.priority === "URGENT").length
        };
    });
}

async function logTaskActivity(taskId: string, userId: string, action: string, fromValue: string | null, toValue: string | null) {
  await prisma.taskActivity.create({
    data: { taskId, userId, action, fromValue, toValue }
  });
}
