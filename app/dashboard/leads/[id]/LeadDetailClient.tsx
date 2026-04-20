"use client";

import { useState } from "react";
import { LeadWithDetails } from "@/lib/types/lead";
import { LeadActivityTimeline } from "@/app/components/leads/LeadActivityTimeline";
import { LeadForm } from "@/app/components/leads/LeadForm";
import { updateLead, addLeadActivity } from "@/lib/actions/leads";
import { User, LeadStatus } from "@prisma/client";
import { LeadFormValues } from "@/lib/schemas/lead";
import { History, LayoutDashboard, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LeadDetailClientProps {
  lead: LeadWithDetails;
  users: Pick<User, "id" | "name" | "email">[];
}

export function LeadDetailClient({ lead, users }: LeadDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"activity" | "details">("activity");

  async function handleUpdateLead(data: LeadFormValues) {
    try {
      await updateLead(lead.id, data);
      toast.success("Lead został zaktualizowany");
      setActiveTab("activity");
    } catch (error) {
      toast.error("Błąd podczas aktualizacji leada");
      throw error;
    }
  }

  async function handleAddNoteAction(formData: FormData) {
    const note = formData.get("note") as string;
    if (!note) return;
    try {
      await addLeadActivity(lead.id, { action: "NOTE_ADDED", content: note });
      toast.success("Notatka została dodana");
      (document.getElementById("note-form") as HTMLFormElement)?.reset();
    } catch (error) {
      toast.error("Błąd podczas dodawania notatki");
    }
  }

  return (
    <div className="flex-grow flex flex-col min-w-0 bg-[#09090b]">
      {/* Tabs / Navigation */}
      <div className="flex items-center border-b border-[#27272a] px-6 h-14 shrink-0 bg-[#0c0c0f]">
        <button 
          onClick={() => setActiveTab("activity")}
          className={cn(
            "flex items-center gap-2 h-full px-4 text-sm font-medium transition-all relative",
            activeTab === "activity" ? "text-[#a78bfa]" : "text-[#a1a1aa] hover:text-[#fafafa]"
          )}
        >
          <History className="w-4 h-4" />
          Aktywność & Notatki
          {activeTab === "activity" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a78bfa]" />}
        </button>
        <button 
          onClick={() => setActiveTab("details")}
          className={cn(
            "flex items-center gap-2 h-full px-4 text-sm font-medium transition-all relative",
            activeTab === "details" ? "text-[#a78bfa]" : "text-[#a1a1aa] hover:text-[#fafafa]"
          )}
        >
          <Settings2 className="w-4 h-4" />
          Szczegóły & Edycja
          {activeTab === "details" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a78bfa]" />}
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-6 lg:p-10 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {activeTab === "activity" ? (
            <div className="space-y-10">
              {/* Quick Note Form */}
              <div className="p-6 bg-[#0c0c0f] border border-[#27272a] rounded-2xl shadow-sm">
                <h3 className="text-[#fafafa] font-medium mb-4 text-sm uppercase tracking-wider">Nowa notatka</h3>
                <form id="note-form" action={handleAddNoteAction} className="space-y-4">
                  <textarea
                    name="note"
                    placeholder="Dodaj szybką notatkę lub komentarz..."
                    rows={3}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-3 text-[#fafafa] focus:ring-2 focus:ring-[#a78bfa] transition-all resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-[#1a1a1c] hover:bg-[#27272a] text-[#fafafa] border border-[#27272a] px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                    >
                      Dodaj notatkę
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-6">
                <h2 className="text-[#fafafa] font-semibold text-lg flex items-center gap-2">
                  <History className="w-5 h-5 text-[#a78bfa]" />
                  Historia aktywności
                </h2>
                <LeadActivityTimeline activities={lead.activities} />
              </div>
            </div>
          ) : (
            <div className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-8 shadow-2xl">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-[#fafafa]">Edycja leada</h2>
                <p className="text-[#a1a1aa] text-sm">Zaktualizuj informacje kontaktowe i status leada.</p>
              </div>
              <LeadForm 
                users={users} 
                initialData={{
                  ...lead,
                  assigneeId: lead.assigneeId || undefined
                }} 
                onSubmit={handleUpdateLead} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
