"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteClient } from "@/lib/actions/clients";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface DeleteClientModalProps {
  clientId: string;
  companyName: string;
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteClientModal({ clientId, companyName, workspaceId, isOpen, onClose }: DeleteClientModalProps) {
  const [confirmName, setConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmName !== companyName) return;

    try {
      setIsDeleting(true);
      await deleteClient(workspaceId, clientId);
      toast.success("Klient został pomyślnie usunięty");
      router.push("/dashboard/clients");
      router.refresh();
    } catch (error) {
      toast.error(error?.message || "Błąd podczas usuwania klienta");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl max-w-md w-full p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button onClick={onClose} className="p-2 text-[#52525b] hover:text-[#fafafa] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#fafafa]">Usuń klienta</h2>
          <p className="text-[#a1a1aa] text-sm leading-relaxed">
            Czy na pewno chcesz usunąć klienta <span className="text-[#fafafa] font-bold">{companyName}</span>? 
            Ta operacja jest nieodwracalna i usunie wszystkie powiązane projekty, faktury i dokumenty.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#52525b] uppercase tracking-widest">
              Wpisz nazwę firmy, aby potwierdzić
            </label>
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={companyName}
              className="w-full bg-[#141416] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-[#fafafa] focus:border-red-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-[#27272a] text-[#a1a1aa] text-sm font-medium hover:bg-[#141416] transition-all"
          >
            Anuluj
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmName !== companyName || isDeleting}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-4 py-2.5 rounded-lg transition-all shadow-lg"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Usuń definitywnie
          </button>
        </div>
      </div>
    </div>
  );
}
