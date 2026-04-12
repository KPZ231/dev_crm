import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getKanbanBoard } from "@/lib/actions/tasks";
import { KanbanBoard } from "@/app/components/tasks/KanbanBoard";
import { TaskHeader } from "@/app/components/tasks/TaskHeader";

export const metadata = {
  title: "Kanban Board | CRM",
  description: "Tablica kanban dla zespołu",
};

export default async function KanbanPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  });

  if (!membership) return null;

  const initialData = await getKanbanBoard(membership.workspaceId);

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-500 overflow-hidden h-full flex flex-col">
      <TaskHeader />
      <div className="flex-grow">
        <KanbanBoard initialData={initialData} workspaceId={membership.workspaceId} />
      </div>
    </div>
  );
}
