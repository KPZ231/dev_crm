import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTemplateById } from "@/lib/actions/documents";
import { TemplateBuilderClient } from "@/app/components/documents/TemplateBuilderClient";
import { notFound } from "next/navigation";

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { id } = await params;

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  });

  if (!membership) return notFound();

  const template = await getTemplateById(membership.workspaceId, id);

  if (!template) return notFound();

  return (
      <TemplateBuilderClient workspaceId={membership.workspaceId} initialData={template} />
  );
}
