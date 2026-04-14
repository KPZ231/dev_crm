"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { costSchema, CostFormValues } from "@/lib/schemas/cost";
import { 
  X, 
  Save, 
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { createCost } from "@/lib/actions/costs";

import { useRouter } from "next/navigation";

interface CostFormDialogProps {
  workspaceId: string;
  projects?: { id: string, name: string }[];
  onSuccess?: () => void;
}

export function CostFormDialog({ workspaceId, projects, onSuccess }: CostFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CostFormValues>({
    resolver: zodResolver(costSchema),
    defaultValues: {
        type: "VARIABLE",
        isRecurring: false,
        date: new Date()
    }
  });

  const onSubmit = async (data: CostFormValues) => {
    try {
        setIsLoading(true);
        await createCost(workspaceId, data);
        reset();
        setIsOpen(false);
        if (onSuccess) {
            onSuccess();
        } else {
            router.refresh();
        }
    } catch (error) {
        console.error(error);
        alert("Błąd podczas dodawania kosztu.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#09090b] font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg active:scale-95"
      >
        <Plus className="w-5 h-5" /> Dodaj Koszt
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[#09090b]/80 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-[#0c0c0f] border border-[#27272a] rounded-3xl p-8 z-[101] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                   <h2 className="text-2xl font-bold text-[#fafafa] tracking-tight">Nowy Koszt</h2>
                   <p className="text-xs text-[#52525b]">Wprowadź wydatek do bazy CRM</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 text-[#52525b] hover:text-[#fafafa] transition-colors bg-[#141416] rounded-xl border border-[#27272a]">
                    <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#52525b]">Nazwa wydatku</label>
                    <input 
                        {...register("name")}
                        className="w-full bg-[#141416] border border-[#27272a] rounded-xl p-3 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none" 
                        placeholder="np: Faktura AWS - Marzec"
                    />
                    {errors.name && <p className="text-red-400 text-[10px] uppercase font-bold">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#52525b]">Kategoria</label>
                        <select 
                            {...register("category")}
                            className="w-full bg-[#141416] border border-[#27272a] rounded-xl p-3 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none"
                        >
                            <option value="DEV">DEV</option>
                            <option value="DESIGN">DESIGN</option>
                            <option value="MARKETING">MARKETING</option>
                            <option value="TOOLS">TOOLS</option>
                            <option value="INFRASTRUCTURE">INFRASTRUCTURE</option>
                            <option value="OUTSOURCING">OUTSOURCING</option>
                            <option value="OTHER">OTHER</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#52525b]">Kwota (PLN)</label>
                        <input 
                            type="number" step="0.01"
                            {...register("amount", { valueAsNumber: true })}
                            className="w-full bg-[#141416] border border-[#27272a] rounded-xl p-3 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none" 
                        />
                        {errors.amount && <p className="text-red-400 text-[10px] uppercase font-bold">{errors.amount.message}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#52525b]">Projekt (opcjonalnie)</label>
                    <select 
                        {...register("projectId")}
                        className="w-full bg-[#141416] border border-[#27272a] rounded-xl p-3 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none"
                    >
                        <option value="">Wybierz projekt...</option>
                        {projects?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-6 p-4 bg-[#141416]/50 rounded-2xl border border-[#27272a]">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" {...register("isRecurring")} className="w-4 h-4 rounded bg-[#141416] border-[#27272a] text-[#a78bfa]" />
                        <span className="text-xs font-bold text-[#fafafa] group-hover:text-[#a78bfa] transition-colors">Koszt cykliczny</span>
                    </label>
                    <div className="h-4 w-px bg-[#27272a]" />
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] text-[#52525b] uppercase font-bold">Typ:</label>
                        <select {...register("type")} className="bg-transparent text-xs font-bold text-[#fafafa] outline-none">
                            <option value="VARIABLE">Zmienny</option>
                            <option value="FIXED">Stały</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#09090b] font-black uppercase tracking-tighter px-5 py-4 rounded-2xl transition-all shadow-xl disabled:opacity-50"
                    >
                        {isLoading ? "Dodawanie..." : <><Save className="w-5 h-5" /> Zapisz koszt</>}
                    </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
