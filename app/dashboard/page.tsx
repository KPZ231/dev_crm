import { auth } from "@/lib/auth";
import { getCachedDashboardStats, getCachedWorkspaces } from "@/lib/data/dashboard";
import Link from "next/link";
import { 
  Users, 
  TrendingUp, 
  Plus, 
  ArrowUpRight, 
  Activity, 
  DollarSign,
  ArrowRight
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Fetch stats and workspaces using the optimized data layer
  const [stats, workspaces] = await Promise.all([
    getCachedDashboardStats(),
    getCachedWorkspaces()
  ]);

  const activeWorkspace = workspaces?.[0]; // Assume first for dashboard landing


  if (!stats || !activeWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-[#0c0c0f] border border-[#27272a] rounded-2xl flex items-center justify-center">
          <TrendingUp className="w-10 h-10 text-[#a78bfa]" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="text-2xl font-bold text-[#fafafa]">Witaj w CRM</h1>
          <p className="text-[#a1a1aa]">Nie przypisano Cię jeszcze do żadnej przestrzeni roboczej lub Twój workspace jest pusty. Zacznij od stworzenia nowej przestrzeni.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#09090b] font-semibold px-6 py-3 rounded-xl transition-all shadow-lg">
          <Plus className="w-5 h-5" /> Utwórz pierwszy Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-[#fafafa] tracking-tight">System Overview</h1>
          <p className="text-[#52525b] text-sm">Witamy ponownie, {session.user.name || session.user.email}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/leads/new"
            className="flex items-center gap-2 bg-[#141416] border border-[#27272a] hover:border-[#a78bfa]/40 text-[#a1a1aa] hover:text-[#fafafa] font-bold px-5 py-2.5 rounded-xl transition-all text-xs"
          >
            <Plus className="w-4 h-4" /> Nowy Lead
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Wszystkie Leady" 
          value={stats.totalLeads} 
          icon={<Users className="w-5 h-5" />} 
          description="Łączna baza"
        />
        <StatCard 
          title="Nowe dzisiaj" 
          value={stats.newLeads} 
          icon={<Activity className="w-5 h-5 text-[#34d399]" />} 
          description="+12% od wczoraj" 
          trend="up"
        />
        {stats.showFinancials && (
          <StatCard 
            title="Potencjał Revenue" 
            value={`${stats.totalPotentialValue.toLocaleString()} PLN`} 
            icon={<DollarSign className="w-5 h-5 text-[#a78bfa]" />} 
            description="Otwarte szanse"
          />
        )}
        <StatCard 
          title="Aktywne Workspaces" 
          value={workspaces.length} 
          icon={<TrendingUp className="w-5 h-5" />} 
          description="Dostępne przestrzenie"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Leads - Main Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-[#fafafa]">Najnowsze szanse</h2>
            <Link href="/dashboard/leads" className="text-[10px] font-black uppercase tracking-widest text-[#a78bfa] hover:underline flex items-center gap-1">
              Zobacz wszystkie <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="bg-[#0c0c0f] border border-[#27272a] rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#27272a] text-[#52525b] text-[10px] uppercase font-black tracking-widest">
                  <th className="px-8 py-5">Firma</th>
                  <th className="px-8 py-5">Status</th>
                  {stats.showFinancials && <th className="px-8 py-5 text-right">Wartość</th>}
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1c]">
                {stats.recentLeads.map((lead: {
                  id: string;
                  companyName: string;
                  contactPerson: string;
                  status: string;
                  potentialValue: number | null;
                }) => (
                  <tr key={lead.id} className="group hover:bg-[#141416] transition-colors">
                    <td className="px-8 py-5">
                      <div className="text-[#fafafa] font-bold text-sm group-hover:text-[#a78bfa] transition-colors">{lead.companyName}</div>
                      <div className="text-[10px] text-[#52525b] font-bold uppercase">{lead.contactPerson}</div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest border ${getStatusStyles(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    {stats.showFinancials && (
                      <td className="px-8 py-5 text-right text-[#fafafa] font-bold text-sm">
                        {lead.potentialValue ? `${lead.potentialValue.toLocaleString()} PLN` : "-"}
                    </td>
                    )}
                    <td className="px-8 py-5 text-right">
                      <Link href={`/dashboard/leads/${lead.id}`} className="p-2 text-[#27272a] hover:text-[#fafafa] transition-colors bg-[#141416] rounded-xl border border-[#27272a]">
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar - Workspaces */}
        <div className="space-y-10">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#fafafa] px-2">Przestrzenie</h2>
            <div className="space-y-4">
              {workspaces.map((ws: { id: string; name: string; slug: string }) => (
                <Link 
                  href={`/dashboard/${ws.slug}`}
                  key={ws.id} 
                  className="flex items-center gap-5 p-5 bg-[#0c0c0f] border border-[#27272a] rounded-2xl hover:border-[#a78bfa]/40 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#141416] border border-[#27272a] flex items-center justify-center font-black text-[#666] group-hover:bg-[#a78bfa] group-hover:text-[#09090b] transition-all transform group-hover:scale-105">
                    {ws.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-sm font-bold text-[#fafafa]">{ws.name}</h3>
                    <p className="text-[10px] text-[#52525b] font-black uppercase tracking-tighter">/{ws.slug}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#27272a] group-hover:text-[#fafafa] transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Productivity Teaser */}
          <div className="p-8 bg-[#0c0c0f] border border-[#27272a] rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#a78bfa]/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[#a78bfa]/10 transition-all" />
            <h3 className="text-[#fafafa] font-bold mb-2 text-sm">Zarządzanie zadaniami</h3>
            <p className="text-[#52525b] text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              Moduł Kanban jest już aktywny w Twoim systemie. Przejdź do sekcji Taski, aby zarządzać pracą zespołu.
            </p>
            <Link href="/dashboard/tasks/kanban" className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#a78bfa] hover:gap-3 transition-all">
                Otwórz Kanban <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  trend?: "up" | "down";
}

function StatCard({ title, value, icon, description, trend }: StatCardProps) {
  return (
    <div className="bg-[#0c0c0f] border border-[#27272a] p-8 rounded-3xl shadow-sm hover:border-[#a78bfa]/20 transition-all relative group overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#a1a1aa]/5 blur-2xl -mr-12 -mt-12 group-hover:bg-[#a78bfa]/5 transition-all" />
      <div className="flex items-center justify-between mb-6">
        <span className="text-[#52525b] text-[10px] font-black uppercase tracking-widest">{title}</span>
        <div className="p-2.5 bg-[#141416] rounded-xl border border-[#27272a] group-hover:text-[#a78bfa] transition-colors">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-black text-[#fafafa] tracking-tight">{value}</div>
          <p className="text-[10px] text-[#52525b] font-bold uppercase mt-1 tracking-wider">{description}</p>
        </div>
        {trend === "up" && (
          <div className="bg-[#34d399]/10 border border-[#34d399]/20 flex items-center gap-1 text-[#34d399] px-2 py-0.5 rounded text-[10px] font-black">
             <ArrowUpRight className="w-3 h-3" />
             2.5%
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusStyles(status: string) {
  switch (status) {
    case "WON": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "NEW": return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    case "PROPOSAL_SENT": return "bg-[#a78bfa]/10 text-[#a78bfa] border-[#a78bfa]/20";
    default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}
