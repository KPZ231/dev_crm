import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TemplateBuilderClient } from "@/app/components/documents/TemplateBuilderClient";
import { notFound } from "next/navigation";

export default async function NewTemplatePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  });

  if (!membership) return notFound();

  return (
      <TemplateBuilderClient workspaceId={membership.workspaceId} />
  );
}
