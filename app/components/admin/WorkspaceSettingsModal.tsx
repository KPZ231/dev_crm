"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { updateWorkspaceAction } from "@/lib/actions/workspaces";
import { X, Save, Building2, Globe, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface WorkspaceSettingsModalProps {
  workspace: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function WorkspaceSettingsModal({ workspace, isOpen, onClose }: WorkspaceSettingsModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: workspace.name,
      logoUrl: workspace.logoUrl || "",
    },
  });

  const onSubmit = async (data: { name: string; logoUrl?: string }) => {
    try {
      setLoading(true);
      const result = await updateWorkspaceAction(workspace.id, data);
      if (result.success) {
        toast.success("Ustawienia firmy zaktualizowane!");
        onClose();
      } else {
        toast.error(result.error || "Wystąpił błąd");
      }
    } catch {
      toast.error("Wystąpił nieoczekiwany błąd");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#09090b]/90 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-[#0c0c0f] border-l border-[#27272a] z-[101] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#27272a] flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-[#a78bfa]/10 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-[#a78bfa]" />
                 </div>
                 <h2 className="text-xl font-bold text-[#fafafa]">Ustawienia firmy</h2>
              </div>
              <button
                disabled={loading}
                onClick={onClose}
                className="p-2 hover:bg-[#141416] rounded-xl transition-colors"
                id="close-workspace-settings"
              >
                <X className="w-5 h-5 text-[#52525b]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <form id="workspace-settings-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#fafafa] uppercase tracking-widest">Nazwa agencji / firmy</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
                    <input
                      {...register("name", { required: "Nazwa jest wymagana" })}
                      placeholder="np. Antigravity Software"
                      className="w-full bg-[#141416] border border-[#27272a] rounded-xl pl-11 pr-4 py-3 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none transition-all"
                    />
                  </div>
                  {errors.name && <p className="text-red-400 text-[10px] mt-1 font-medium">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#fafafa] uppercase tracking-widest">URL Logo</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
                    <input
                      {...register("logoUrl")}
                      placeholder="https://..."
                      className="w-full bg-[#141416] border border-[#27272a] rounded-xl pl-11 pr-4 py-3 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-zinc-800/20 border border-[#27272a] rounded-xl">
                   <p className="text-[11px] text-[#52525b] leading-relaxed">
                     Zmiana nazwy firmy wpłynie na generowanie dokumentów (umów, ofert, faktur) oraz na wyświetlaną nazwę w panelu wszystkich Twoich pracowników.
                   </p>
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#27272a] flex justify-end gap-3 bg-[#0c0c0f]">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-[#fafafa] border border-[#27272a] hover:bg-[#141416] transition-colors"
                id="cancel-workspace-settings"
              >
                Anuluj
              </button>
              <button
                type="submit"
                form="workspace-settings-form"
                disabled={loading}
                className="flex items-center gap-2 bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#09090b] font-bold px-8 py-2.5 rounded-xl text-xs transition-all shadow-lg disabled:opacity-50"
                id="save-workspace-settings"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {loading ? "Zapisywanie..." : "Zapisz zmiany"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
