import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientById } from "@/lib/actions/clients";
import { notFound } from "next/navigation";
import { 
  Building2, 
  ChevronLeft, 
  ExternalLink, 
  Globe,
  DollarSign,
  Briefcase,
  Clock,
  Edit
} from "lucide-react";
import Link from "next/link";
import { ClientDetailClient } from "./ClientDetailClient";
import { canViewClientFinancials } from "@/lib/permissions";
import { Invoice } from "@prisma/client";

import { ClientActionsHeader } from "@/app/components/clients/ClientActionsHeader";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
  });

  if (!membership) return null;

  const client = await getClientById(membership.workspaceId, id);

  if (!client) {
    notFound();
  }

  const showFinancials = canViewClientFinancials(membership.role);

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b]">
      {/* Hero Bar */}
      <div className="bg-[#0c0c0f] border-b border-[#27272a] p-6 lg:px-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4 text-[#52525b]">
            <Link href="/dashboard/clients" className="flex items-center gap-1 hover:text-[#a78bfa] transition-colors text-sm">
              <ChevronLeft className="w-4 h-4" /> Powrót do listy
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-[#141416] border border-[#27272a] flex items-center justify-center text-3xl font-bold text-[#fafafa] shadow-2xl">
                {client.companyName.substring(0, 1).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-[#fafafa] tracking-tight">{client.companyName}</h1>
                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyles(client.status)}`}>
                      {client.status}
                    </span>
                    {(client as any).isProjectFinished && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        UKOŃCZONY
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[#a1a1aa] text-sm">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#52525b]" />
                    <span>NIP: {client.nip || "N/A"}</span>
                  </div>
                  {client.website && (
                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#a78bfa] transition-colors">
                      <Globe className="w-4 h-4 text-[#52525b]" />
                      <span>{client.website.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {client.industry && (
                      <div className="flex items-center gap-1.5 font-medium text-[#a78bfa]/80">
                          <span className="uppercase tracking-widest text-[10px]">{client.industry}</span>
                      </div>
                  )}
                </div>
              </div>
            </div>

            <ClientActionsHeader 
              clientId={client.id} 
              companyName={client.companyName}
              workspaceId={membership.workspaceId}
              isProjectFinished={(client as any).isProjectFinished}
            />
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              label="Total Revenue" 
              value={showFinancials ? `${client.invoices.reduce((acc: number, inv: Invoice) => acc + inv.amount, 0).toLocaleString()} PLN` : "HIDDEN"} 
              icon={<DollarSign className="w-5 h-5 text-[#34d399]" />}
              description="Suma wszystkich faktur"
            />
            <StatCard 
              label="Active Projects" 
              value={client.projects.length.toString()} 
              icon={<Briefcase className="w-5 h-5 text-[#a78bfa]" />}
              description="W trakcie realizacji"
            />
            <StatCard 
              label="Outstanding" 
              value={showFinancials ? `${client.invoices.filter((inv: Invoice) => inv.status !== "PAID").reduce((acc: number, inv: Invoice) => acc + inv.amount, 0).toLocaleString()} PLN` : "HIDDEN"} 
              icon={<Clock className="w-5 h-5 text-orange-400" />}
              description={`${client.invoices.filter((inv: Invoice) => inv.status !== "PAID").length} zaległych faktur`}
            />
             <StatCard 
              label="Current Status" 
              value={client.paymentStatus} 
              icon={<ActivityIcon className="w-5 h-5" />}
              description="Rating płatności"
              colorStyle={getPaymentStatusStyles(client.paymentStatus)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 lg:px-10 pb-20">
        <ClientDetailClient client={client} showFinancials={showFinancials} />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, description, colorStyle }: {
  label: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  colorStyle?: string;
}) {
  return (
    <div className="bg-[#0c0c0f] border border-[#27272a] p-6 rounded-xl hover:border-[#a78bfa]/20 transition-all">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[#52525b] text-[10px] font-bold uppercase tracking-widest">{label}</span>
        <div className="p-2 bg-[#141416] rounded-lg border border-[#27272a]">
          {icon}
        </div>
      </div>
      <div>
        <div className={`text-2xl font-bold tracking-tight ${colorStyle?.includes('text-') ? colorStyle.split(' ')[1] : 'text-[#fafafa]'}`}>
            {value}
        </div>
        <p className="text-xs text-[#52525b] mt-1 line-clamp-1">{description}</p>
      </div>
    </div>
  );
}

function getStatusStyles(status: string) {
  switch (status) {
    case "ACTIVE": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "INACTIVE": return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    case "LEAD": return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    case "ARCHIVED": return "bg-red-500/ red-400 border-red-500/20";
    default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}

function getPaymentStatusStyles(status: string) {
  switch (status) {
    case "PAID":
    case "UP_TO_DATE": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "OVERDUE": return "bg-red-500/10 text-red-400 border-red-500/20 text-red-400";
    case "AT_RISK": return "bg-orange-500/10 text-orange-400 border-orange-500/20 text-orange-400";
    default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}

function ActivityIcon({ className }: { className?: string }) {
    return <Clock className={className} />
}
