import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTasks } from "@/lib/actions/tasks";
import { TaskListTable } from "@/app/components/tasks/TaskListTable";
import { TaskHeader } from "@/app/components/tasks/TaskHeader";
import { TaskStatus, TaskPriority } from "@prisma/client";

export const metadata = {
  title: "Tasks List | CRM",
  description: "Zestawienie wszystkich zadań",
};

export default async function TasksListPage({
  searchParams,
}: {
  searchParams: { status?: string; priority?: string; search?: string };
}) {
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
    <div className="p-8 lg:p-12 animate-in fade-in duration-500">
      <TaskHeader workspaceId={membership.workspaceId} />
      <div className="space-y-6">
        <TaskListTable tasks={tasks} workspaceId={membership.workspaceId} />
      </div>
    </div>
  );
}
