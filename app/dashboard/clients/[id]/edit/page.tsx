import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientById } from "@/lib/actions/clients";
import { redirect, notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ClientEditClient } from "./ClientEditClient";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
  });

  if (!membership) redirect("/dashboard");

  const client = await getClientById(membership.workspaceId, id);

  if (!client) notFound();

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b]">
      <div className="p-8 border-b border-[#27272a] bg-[#0c0c0f]/30">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link href={`/dashboard/clients/${id}`} className="flex items-center gap-1 text-[#52525b] hover:text-[#a78bfa] transition-colors text-sm w-fit">
            <ChevronLeft className="w-4 h-4" /> Powrót do szczegółów
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#fafafa] tracking-tight">Edytuj Klienta</h1>
            <p className="text-[#a1a1aa] text-sm mt-1">Zaktualizuj dane firmy {client.companyName}</p>
          </div>
        </div>
      </div>

      <div className="p-8 pb-20">
        <div className="max-w-4xl mx-auto bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-8 shadow-2xl">
          <ClientEditClient client={client} workspaceId={membership.workspaceId} />
        </div>
      </div>
    </div>
  );
}
