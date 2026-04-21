"use client";

import { useState } from "react";
import { Edit, Trash2, Plus, CheckCircle2, RotateCcw, Loader2 } from "lucide-react";
import Link from "next/link";
import { DeleteClientModal } from "./DeleteClientModal";
import { toggleProjectFinished } from "@/lib/actions/clients";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ClientActionsHeaderProps {
  clientId: string;
  companyName: string;
  workspaceId: string;
  isProjectFinished: boolean;
}

export function ClientActionsHeader({ clientId, companyName, workspaceId, isProjectFinished }: ClientActionsHeaderProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const router = useRouter();

  const handleToggleFinished = async () => {
    try {
      setIsToggling(true);
      await toggleProjectFinished(workspaceId, clientId, !isProjectFinished);
      toast.success(isProjectFinished ? "Przywrócono projekt do aktywnych" : "Oznaczono projekt jako ukończony");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd podczas zmiany statusu");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Edit Button */}
      <Link
        href={`/dashboard/clients/${clientId}/edit`}
        className="p-2.5 bg-[#141416] border border-[#27272a] rounded-lg text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#a78bfa]/40 transition-all shadow-sm"
        title="Edytuj dane klienta"
      >
        <Edit className="w-5 h-5" />
      </Link>

      {/* Delete Button */}
      <button
        onClick={() => setIsDeleteModalOpen(true)}
        className="p-2.5 bg-[#141416] border border-[#27272a] rounded-lg text-red-500/70 hover:text-red-500 hover:border-red-500/40 transition-all shadow-sm"
        title="Usuń klienta"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      <div className="h-8 w-[1px] bg-[#27272a] mx-1" />

      {/* Completion Toggle */}
      <button
        onClick={handleToggleFinished}
        disabled={isToggling}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg ${isProjectFinished
          ? "bg-emerald-500 text-[#0c0c0f] hover:bg-emerald-600"
          : "bg-[#141416] border border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#34d399]/40"
          }`}
      >
        {isToggling ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isProjectFinished ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <RotateCcw className="w-4 h-4" />
        )}
        {isProjectFinished ? "Projekt Ukończony" : "Oznacz jako ukończony"}
      </button>

      {/* Add Project Button */}
      <Link
        href={`/dashboard/projects/new?clientId=${clientId}`}
        className="flex items-center gap-2 bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#09090b] font-bold px-6 py-2.5 rounded-lg transition-all shadow-lg"
      >
        <Plus className="w-4 h-4" />
        Utwórz Projekt
      </Link>

      <DeleteClientModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        clientId={clientId}
        companyName={companyName}
        workspaceId={workspaceId}
      />
    </div>
  );
}
