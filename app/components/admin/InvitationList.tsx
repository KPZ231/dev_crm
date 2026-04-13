"use client";

import { useState } from "react";
import { cancelInvitation } from "@/lib/actions/admin";
import { Clock, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Invitation {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  invitedBy: {
    name: string | null;
    email: string;
  };
}

interface InvitationListProps {
  workspaceId: string;
  invitations: Invitation[];
}

export function InvitationList({ workspaceId, invitations }: InvitationListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    try {
      setLoadingId(id);
      await cancelInvitation(workspaceId, id);
      toast.success("Zaproszenie cofnięte");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Błąd";
      toast.error(message);
    } finally {
      setLoadingId(null);
    }
  };

  if (invitations.length === 0) return null;

  return (
    <div className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center gap-2 mb-2">
         <Clock className="w-4 h-4 text-[#a78bfa]" />
         <h3 className="text-sm font-bold text-[#fafafa] uppercase tracking-wider">Oczekujące zaproszenia</h3>
      </div>
      
      <div className="space-y-3">
        {invitations.map((invite) => (
          <div key={invite.id} className="flex items-center justify-between p-3 bg-[#141416] rounded-xl border border-[#27272a] hover:border-[#a78bfa]/20 transition-all">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#fafafa]">{invite.email}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-[#52525b] uppercase font-bold tracking-widest">{invite.role}</span>
                <span className="w-1 h-1 bg-[#27272a] rounded-full" />
                <span className="text-[10px] text-[#52525b]">Od: {invite.invitedBy.name || invite.invitedBy.email}</span>
              </div>
            </div>
            <button
              onClick={() => handleCancel(invite.id)}
              disabled={loadingId === invite.id}
              className="p-2 text-[#52525b] hover:text-red-400 bg-[#0c0c0f] border border-[#27272a] rounded-lg transition-all"
            >
              {loadingId === invite.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
