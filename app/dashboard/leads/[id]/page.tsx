import { Metadata } from "next";
import { getLeadById, addLeadActivity } from "@/lib/actions/leads";
import { LeadActivityTimeline } from "@/app/components/leads/LeadActivityTimeline";
import { notFound, redirect } from "next/navigation";
import { LeadStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { canViewFinancials } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Mail, Phone, Globe, Calendar, BadgeDollarSign, User as UserIcon, History } from "lucide-react";
import Image from "next/image";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const lead = await getLeadById(id);
  return { title: `${lead?.companyName || "Lead detail"} | CRM` };
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const lead = await getLeadById(id);

  if (!lead) notFound();

  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  });

  const showFinancials = canViewFinancials(member!.role);

  async function handleAddNote(formData: FormData) {
    "use server";
    const note = formData.get("note") as string;
    if (!note) return;
    await addLeadActivity(id, { action: "NOTE_ADDED", content: note });
  }

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-[#09090b]">
      {/* Sidebar - Detail Info */}
      <div className="w-full lg:w-96 border-r border-[#27272a] overflow-y-auto p-6 space-y-8 bg-[#0c0c0f]">
        <div>
          <h1 className="text-2xl font-bold text-[#fafafa] tracking-tight">{lead.companyName}</h1>
          <p className="text-[#a1a1aa]">{lead.contactPerson}</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-[#a1a1aa]">
            <Mail className="w-4 h-4 text-[#a78bfa]" />
            <a href={`mailto:${lead.email}`} className="hover:text-[#fafafa] transition-colors">
              {lead.email || "Brak emaila"}
            </a>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#a1a1aa]">
            <Phone className="w-4 h-4 text-[#a78bfa]" />
            <span>{lead.phone || "Brak telefonu"}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#a1a1aa]">
            <Globe className="w-4 h-4 text-[#a78bfa]" />
            <span>{lead.source || "Źródło nieznane"}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#a1a1aa]">
            <Calendar className="w-4 h-4 text-[#a78bfa]" />
            <span>Dodano: {new Date(lead.createdAt).toLocaleDateString("pl-PL")}</span>
          </div>
          {showFinancials && (
            <div className="flex items-center gap-3 text-sm text-[#34d399] font-medium">
              <BadgeDollarSign className="w-4 h-4" />
              <span>{lead.potentialValue ? `${lead.potentialValue.toLocaleString()} PLN` : "0.00 PLN"}</span>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-[#27272a]">
          <h2 className="text-[#fafafa] font-semibold mb-4 text-sm uppercase tracking-wider">Status</h2>
          <div className="flex flex-wrap gap-2">
             {Object.values(LeadStatus).map(status => (
                <span key={status} className={`px-2 py-1 rounded text-xs border ${lead.status === status ? "bg-[#a78bfa] text-[#09090b] border-[#a78bfa]" : "bg-transparent text-[#a1a1aa] border-[#27272a]"}`}>
                  {status}
                </span>
             ))}
          </div>
        </div>

        <div className="pt-6 border-t border-[#27272a]">
          <h2 className="text-[#fafafa] font-semibold mb-4 text-sm uppercase tracking-wider">Przypisany</h2>
          {lead.assignee ? (
            <div className="flex items-center gap-3 p-3 bg-[#09090b] border border-[#27272a] rounded-lg">
              {lead.assignee.image ? (
                <Image src={lead.assignee.image} width={32} height={32} className="w-8 h-8 rounded-full" alt={lead.assignee.name || "User"} />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1a1a1c] flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-[#a1a1aa]" />
                </div>
              )}
              <div className="text-sm">
                <div className="text-[#fafafa] font-medium">{lead.assignee.name || "Bez imienia"}</div>
                <div className="text-[#a1a1aa] text-xs">{lead.assignee.email}</div>
              </div>
            </div>
          ) : (
            <div className="text-[#52525b] text-sm italic">Nikt nie jest przypisany</div>
          )}
        </div>
      </div>

      {/* Main Content - Timeline & Quick Form */}
      <div className="flex-grow flex flex-col min-w-0 bg-[#09090b]">
        {/* Tabs / Navigation */}
        <div className="flex items-center border-b border-[#27272a] px-6 h-14 shrink-0">
          <button className="text-[#a78bfa] border-b-2 border-[#a78bfa] h-full px-4 text-sm font-medium">
            Aktywność & Notatki
          </button>
          <button className="text-[#a1a1aa] hover:text-[#fafafa] px-4 text-sm font-medium transition-colors">
            Szczegóły & Edycja
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 lg:p-10">
          <div className="max-w-3xl space-y-10">
            {/* Quick Note Form */}
            <form action={handleAddNote} className="space-y-4">
              <textarea
                name="note"
                placeholder="Dodaj szybką notatkę lub komentarz..."
                rows={3}
                className="w-full bg-[#0c0c0f] border border-[#27272a] rounded-xl px-4 py-3 text-[#fafafa] focus:ring-2 focus:ring-[#a78bfa] transition-all resize-none shadow-sm"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-[#1a1a1c] hover:bg-[#27272a] text-[#fafafa] border border-[#27272a] px-5 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  Dodaj notatkę
                </button>
              </div>
            </form>

            <div className="space-y-6">
              <h2 className="text-[#fafafa] font-semibold text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-[#a78bfa]" />
                Historia aktywności
              </h2>
              <LeadActivityTimeline activities={lead.activities} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
