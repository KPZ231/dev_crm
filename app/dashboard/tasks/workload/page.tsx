import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWorkload } from "@/lib/actions/tasks";
import { WorkloadView } from "@/app/components/tasks/WorkloadView";
import { TaskHeader } from "@/app/components/tasks/TaskHeader";

export const metadata = {
  title: "Team Workload | CRM",
  description: "Obciążenie zespołu i wydajność",
};

export default async function WorkloadPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  });

  if (!membership) return null;

  const workload = await getWorkload(membership.workspaceId);

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-500">
      <TaskHeader workspaceId={membership.workspaceId} />
      <WorkloadView workload={workload} />
    </div>
  );
}
