import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { 
  ShieldCheck, 
  ChevronRight
} from "lucide-react";
import { getCachedWorkspaceMembers, getCachedInvitations } from "@/lib/data/admin";
import { MemberList } from "@/app/components/admin/MemberList";
import { InviteUserForm } from "@/app/components/admin/InviteUserForm";
import { InvitationList } from "@/app/components/admin/InvitationList";
import { WorkspaceSettingsButton } from "@/app/components/admin/WorkspaceSettingsButton";

export const metadata = {
  title: "Admin Panel | CRM",
  description: "Zarządzaj zespołem i ustawieniami swojej agencji",
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    select: { 
      role: true, 
      workspaceId: true,
      workspace: { select: { name: true, logoUrl: true } }
    }
  });

  if (!membership) redirect("/dashboard");

  // Only allow OWNERS and ADMINS
  if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [members, invitations] = await Promise.all([
    getCachedWorkspaceMembers(membership.workspaceId),
    getCachedInvitations(membership.workspaceId)
  ]);


  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-2 text-[#a78bfa] font-bold text-[10px] uppercase tracking-[0.2em] mb-2">
            <ShieldCheck className="w-4 h-4" />
            Workspace Administration
          </div>
          <h1 className="text-4xl font-bold text-[#fafafa] tracking-tight">{membership.workspace.name}</h1>
          <p className="text-sm text-[#52525b] mt-2 flex items-center gap-2">
            Konfiguracja systemu i zarządzanie dostępem <ChevronRight className="w-3 h-3" /> <span className="text-[#a1a1aa]">{membership.role}</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-6 py-3 bg-[#0c0c0f] border border-[#27272a] rounded-2xl flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-[#fafafa]">
                {members.length}
             </div>
             <div className="flex flex-col">
                <span className="text-xs font-bold text-[#fafafa]">Aktywni członkowie</span>
                <span className="text-[10px] text-[#52525b]">Wszyscy użytkownicy</span>
             </div>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Member List */}
        <div className="xl:col-span-2 space-y-8">
            <MemberList 
              workspaceId={membership.workspaceId} 
              members={members} 
              currentUserId={session.user.id} 
              currentUserRole={membership.role} 
            />

            <WorkspaceSettingsButton 
               workspace={{ 
                 id: membership.workspaceId, 
                 name: membership.workspace.name, 
                 logoUrl: membership.workspace.logoUrl 
               }} 
            />
        </div>

        {/* Right Column: Invite & Invitations */}
        <div className="space-y-8">
          <InviteUserForm workspaceId={membership.workspaceId} />
          <InvitationList workspaceId={membership.workspaceId} invitations={invitations} />
        </div>

      </div>
    </div>
  );
}
