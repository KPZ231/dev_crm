import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDocumentById } from "@/lib/actions/documents";
import { notFound } from "next/navigation";
import { DocumentDetailClient } from "./DocumentDetailClient";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  });

  if (!membership) return null;

  const document = await getDocumentById(membership.workspaceId, id);

  if (!document) {
    notFound();
  }

  return (
    <div className="w-full h-full">
      <DocumentDetailClient document={document} workspaceId={membership.workspaceId} />
    </div>
  );
}
