import { Metadata } from "next";
import { LeadForm } from "@/app/components/leads/LeadForm";
import { createLead, getWorkspaceUsers } from "@/lib/actions/leads";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CreateLeadInput } from "@/lib/schemas/lead";

export const metadata: Metadata = {
  title: "Nowy Lead | CRM",
};

export default async function NewLeadPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const users = await getWorkspaceUsers();

  async function handleCreate(data: CreateLeadInput) {
    "use server";
    await createLead(data);
    redirect("/dashboard/leads");
  }

  return (
    <div className="p-6 bg-[#09090b] min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#fafafa] tracking-tight">Dodaj nowego leada</h1>
          <p className="text-[#a1a1aa] text-sm">Wprowadź dane firmy i osoby kontaktowej</p>
        </div>

        <div className="bg-[#0c0c0f] border border-[#27272a] rounded-xl p-8 shadow-2xl">
          <LeadForm users={users} onSubmit={handleCreate} />
        </div>
      </div>
    </div>
  );
}
