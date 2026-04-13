"use client";

import { useState } from "react";
import { updateMemberRole, removeMember } from "@/lib/actions/admin";
import { WorkspaceRole } from "@prisma/client";
import { User, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Member {
  id: string;
  role: WorkspaceRole;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface MemberListProps {
  workspaceId: string;
  members: Member[];
  currentUserId: string;
  currentUserRole: WorkspaceRole;
}

export function MemberList({ workspaceId, members, currentUserId, currentUserRole }: MemberListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRoleChange = async (memberId: string, newRole: WorkspaceRole) => {
    try {
      setLoadingId(memberId);
      await updateMemberRole(workspaceId, memberId, { role: newRole });
      toast.success("Rola zaktualizowana!");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Błąd";
      toast.error(message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tego członka?")) return;

    try {
      setLoadingId(memberId);
      await removeMember(workspaceId, memberId);
      toast.success("Członek usunięty!");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Błąd";
      toast.error(message);
    } finally {
      setLoadingId(null);
    }
  };

  const canManage = (member: Member) => {
    if (currentUserRole === "OWNER") return member.user.id !== currentUserId;
    if (currentUserRole === "ADMIN") return member.role !== "OWNER" && member.role !== "ADMIN";
    return false;
  };

  return (
    <div className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-[#27272a]">
        <h3 className="text-lg font-bold text-[#fafafa]">Członkowie zespołu</h3>
        <p className="text-xs text-[#52525b]">Zarządzaj dostępem i rolami w swojej firmie</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#27272a] text-[#52525b] text-[10px] uppercase font-bold tracking-widest bg-[#141416]/30">
              <th className="px-6 py-4">Użytkownik</th>
              <th className="px-6 py-4">Rola</th>
              <th className="px-6 py-4 text-right">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1c]">
            {members.map((member) => (
              <tr key={member.id} className="group hover:bg-[#141416]/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {member.user.image ? (
                      <Image 
                        src={member.user.image} 
                        width={32} 
                        height={32} 
                        className="w-8 h-8 rounded-xl border border-[#27272a] object-cover" 
                        alt={member.user.name || "User"} 
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center border border-[#27272a]">
                        <User className="w-4 h-4 text-[#52525b]" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[#fafafa]">
                        {member.user.name || "Anonimowy"} {member.user.id === currentUserId && <span className="text-[#a78bfa] text-[10px] ml-1">(Ty)</span>}
                      </span>
                      <span className="text-xs text-[#52525b]">{member.user.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {canManage(member) ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as WorkspaceRole)}
                      disabled={loadingId === member.id}
                      className="bg-[#141416] border border-[#27272a] text-xs text-[#fafafa] rounded-lg px-2 py-1 outline-none focus:border-[#a78bfa]"
                    >
                      <option value="DEVELOPER">Developer</option>
                      <option value="PM">PM</option>
                      <option value="SALES">Sales</option>
                      <option value="ADMIN">Admin</option>
                      <option value="OWNER">Owner</option>
                    </select>
                  ) : (
                    <span className="px-2 py-1 bg-[#141416] rounded-lg text-[10px] font-bold text-[#a1a1aa] border border-[#27272a]">
                      {member.role}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {canManage(member) && (
                    <div className="flex justify-end gap-2">
                       <button
                        onClick={() => handleRemove(member.id)}
                        disabled={loadingId === member.id}
                        className="p-2 text-[#52525b] hover:text-red-400 bg-[#141416] border border-[#27272a] rounded-lg transition-all"
                      >
                        {loadingId === member.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
