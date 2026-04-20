import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTasks } from "@/lib/actions/tasks";
import { TasksListPageClient } from "./TasksListPageClient";
import { TaskStatus, TaskPriority } from "@prisma/client";

export const metadata = {
  title: "Tasks List | CRM",
  description: "Zestawienie wszystkich zadań",
};

export default async function TasksListPage(props: {
  searchParams: Promise<{ status?: string; priority?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  });

  if (!membership) return null;

  const tasks = await getTasks(membership.workspaceId, {
    status: searchParams.status as TaskStatus,
    priority: searchParams.priority as TaskPriority,
    search: searchParams.search
  });

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-500 min-h-screen">
      <TasksListPageClient tasks={tasks} workspaceId={membership.workspaceId} />
    </div>
  );
}


