import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getKanbanBoard } from "@/lib/actions/tasks";
import { KanbanPageClient } from "./KanbanPageClient";
import { TaskPriority } from "@prisma/client";

export const metadata = {
  title: "Kanban Board | CRM",
  description: "Tablica kanban dla zespołu",
};

export default async function KanbanPage(props: {
  searchParams: Promise<{ search?: string; priority?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  });

  if (!membership) return null;

  const initialData = await getKanbanBoard(membership.workspaceId, {
      search: searchParams.search,
      priority: searchParams.priority as TaskPriority
  });

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-500 overflow-hidden h-full flex flex-col min-h-screen">
      <KanbanPageClient initialData={initialData} workspaceId={membership.workspaceId} />
    </div>
  );
}



