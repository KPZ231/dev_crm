"use client";

import { useState } from "react";
import { ClientWithDetails } from "@/lib/types/client";
import { ClientTabs } from "@/app/components/clients/ClientTabs";
import { ClientTimeline } from "@/app/components/clients/ClientTimeline";
import { 
  Building2, 
  Briefcase,
  Receipt,
  FileText,
  Plus
} from "lucide-react";
import { Project, Invoice, Document } from "@prisma/client";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import Link from "next/link";

interface ClientDetailClientProps {
  client: ClientWithDetails;
  showFinancials: boolean;
}

export function ClientDetailClient({ client, showFinancials }: ClientDetailClientProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const counts = {
    projects: client.projects.length,
    invoices: client.invoices.length,
    documents: client.documents.length,
  };

  return (
    <div className="space-y-8">
      <ClientTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
               {/* Contact details card */}
               <div className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-8 space-y-6 shadow-xl">
                  <h3 className="text-lg font-bold text-[#fafafa] flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#a78bfa]" />
                    Dane kontaktowe
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <InfoItem label="Osoba kontaktowa" value={client.contactPerson} />
                    <InfoItem label="Email" value={client.email} />
                    <InfoItem label="Telefon" value={client.phone} />
                    <InfoItem label="Adres" value={client.address} fullWidth />
                  </div>
               </div>

               {/* Notes Section */}
               <div className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-8 space-y-4 shadow-xl">
                  <h3 className="text-lg font-bold text-[#fafafa]">Notatki wewnętrzne</h3>
                  <div className="bg-[#141416] border border-[#27272a] rounded-xl p-6 text-[#a1a1aa] text-sm leading-relaxed whitespace-pre-wrap min-h-[150px]">
                    {client.notes || "Brak notatek dla tego klienta."}
                  </div>
               </div>
            </div>

            <div className="space-y-8">
               <div className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-[#fafafa] uppercase tracking-widest">Informacje systemowe</h3>
                  <div className="space-y-4">
                    <DetailRow label="Dodano" value={format(new Date(client.createdAt), "dd MMMM yyyy", { locale: pl })} />
                    <DetailRow label="Ostatnia zmiana" value={format(new Date(client.updatedAt), "dd MMMM yyyy", { locale: pl })} />
                    <DetailRow label="Workspace ID" value={client.workspaceId} mono />
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#fafafa]">Aktywne projekty</h3>
                <Link 
                  href={`/dashboard/projects/new?clientId=${client.id}`}
                  className="flex items-center gap-2 text-sm text-[#a78bfa] hover:text-[#8b5cf6] transition-all font-medium"
                >
                    <Plus className="w-4 h-4" /> Nowy Projekt
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {client.projects.map((p: Project) => (
                 <div key={p.id} className="grow bg-[#0c0c0f] border border-[#27272a] rounded-xl p-6 hover:border-[#a78bfa]/30 transition-all">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h4 className="font-bold text-[#fafafa]">{p.name}</h4>
                            <p className="text-[10px] text-[#52525b] uppercase tracking-widest mt-0.5">{p.status}</p>
                        </div>
                        <span className="text-xs font-mono text-[#a1a1aa]">{format(new Date(p.createdAt), "MM/yyyy")}</span>
                    </div>
                    {showFinancials && p.budget && (
                        <div className="text-sm text-[#34d399] font-medium">{p.budget.toLocaleString()} PLN</div>
                    )}
                 </div>
               ))}
               {client.projects.length === 0 && (
                 <EmptyState icon={<Briefcase className="w-10 h-10" />} message="Brak przypisanych projektów." />
               )}
            </div>
          </div>
        )}

        {activeTab === "invoices" && (
            <div className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-[#27272a] text-[10px] text-[#52525b] uppercase tracking-widest">
                            <th className="px-6 py-4">Numer</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Termin</th>
                            <th className="px-6 py-4 text-right">Kwota</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1a1c]">
                        {client.invoices.map((inv: Invoice) => (
                            <tr key={inv.id} className="hover:bg-[#141416] transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-[#fafafa]">{inv.number}</td>
                                <td className="px-6 py-4 inline-flex">
                                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] text-[#a1a1aa] border border-[#27272a]">
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-[#52525b]">{format(new Date(inv.dueDate), "dd.MM.yyyy")}</td>
                                <td className="px-6 py-4 text-right text-sm font-bold text-[#fafafa]">{inv.amount.toLocaleString()} PLN</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {client.invoices.length === 0 && (
                    <div className="p-20 text-center">
                        <Receipt className="w-12 h-12 text-[#27272a] mx-auto mb-4" />
                        <p className="text-[#a1a1aa] text-sm">Brak wystawionych faktur.</p>
                    </div>
                )}
            </div>
        )}

        {activeTab === "documents" && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {client.documents.map((doc: Document) => (
                    <div key={doc.id} className="flex items-center gap-4 bg-[#0c0c0f] border border-[#27272a] rounded-xl p-4 group hover:border-[#a78bfa]/40 transition-all cursor-pointer">
                        <div className="w-10 h-10 rounded-lg bg-[#141416] border border-[#27272a] flex items-center justify-center">
                            <FileText className="w-5 h-5 text-[#a78bfa]" />
                        </div>
                        <div className="grow min-w-0">
                            <div className="text-sm font-medium text-[#fafafa] truncate group-hover:text-[#a78bfa] transition-colors">{doc.name}</div>
                            <div className="text-[10px] text-[#52525b] flex items-center gap-2">
                                <span>{doc.type}</span>
                                <span>•</span>
                                <span>{format(new Date(doc.createdAt), "dd.MM.yyyy")}</span>
                            </div>
                        </div>
                    </div>
                ))}
                {client.documents.length === 0 && (
                    <div className="col-span-full py-20 bg-[#0c0c0f] border border-[#27272a] rounded-2xl border-dashed text-center">
                         <FileText className="w-10 h-10 text-[#27272a] mx-auto mb-3" />
                         <p className="text-[#52525b] text-sm">Brak dokumentów powiązanych z klientem.</p>
                    </div>
                )}
           </div>
        )}

        {activeTab === "activity" && (
          <div className="max-w-4xl">
            <ClientTimeline activities={client.activities} />
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value, fullWidth }: { label: string; value?: string | null; fullWidth?: boolean }) {
  return (
    <div className={fullWidth ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}>
      <span className="text-[10px] font-bold text-[#52525b] uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2 text-[#a1a1aa] text-sm">
        {value || <span className="italic text-[#27272a]">Brak danych</span>}
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#27272a]/50 last:border-0">
      <span className="text-xs text-[#52525b]">{label}</span>
      <span className={`text-xs text-[#a1a1aa] ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-[#0c0c0f] border border-[#27272a] rounded-xl border-dashed col-span-full">
      <div className="mb-4 text-[#27272a]">{icon}</div>
      <p className="text-[#52525b] text-sm">{message}</p>
    </div>
  );
}
