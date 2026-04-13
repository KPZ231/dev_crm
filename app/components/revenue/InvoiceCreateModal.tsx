"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, InvoiceFormValues } from "@/lib/schemas/revenue";
import { X, Save, DollarSign, FileText, Calendar, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { createInvoice, getInvoiceFormOptions } from "@/lib/actions/revenue";
import { toast } from "sonner";

interface InvoiceCreateModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceCreateModal({ workspaceId, isOpen, onClose }: InvoiceCreateModalProps) {
  const [options, setOptions] = useState<{ clients: { id: string, companyName: string }[] }>({ clients: [] });
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      status: "DRAFT",
      amount: 0,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 14)), // Default 14 days
    }
  });

  useEffect(() => {
    if (isOpen) {
      getInvoiceFormOptions(workspaceId).then(setOptions).catch(console.error);
    }
  }, [isOpen, workspaceId]);

  const onSubmit = async (data: InvoiceFormValues) => {
    try {
      setLoading(true);
      await createInvoice(workspaceId, data);
      toast.success("Faktura została pomyślnie utworzona");
      reset();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Wystąpił błąd podczas tworzenia faktury");
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-2xl h-fit bg-[#0c0c0f] border border-[#27272a] rounded-3xl z-[101] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-[#27272a] flex items-center justify-between bg-[#141416]/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#a78bfa]/10 rounded-2xl flex items-center justify-center border border-[#a78bfa]/20">
                  <FileText className="w-6 h-6 text-[#a78bfa]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#fafafa] tracking-tight">Nowa Faktura</h2>
                  <p className="text-xs text-[#52525b]">Wystaw nową fakturę dla swojego klienta</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-[#141416] rounded-xl transition-colors">
                <X className="w-5 h-5 text-[#52525b]" />
              </button>
            </div>

            {/* Content */}
            <form id="create-invoice-form" onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                {/* Client selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#52525b] uppercase tracking-[0.2em] flex items-center gap-2">
                    <User className="w-3 h-3" /> Klient
                  </label>
                  <select 
                    {...register("clientId")}
                    className="w-full bg-[#141416] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none transition-all appearance-none"
                  >
                    <option value="">Wybierz klienta...</option>
                    {options.clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                  </select>
                  {errors.clientId && <p className="text-red-400 text-[10px] mt-1 font-medium">{errors.clientId.message}</p>}
                </div>

                {/* Invoice Number */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#52525b] uppercase tracking-[0.2em] flex items-center gap-2">
                    <FileText className="w-3 h-3" /> Numer Faktury
                  </label>
                  <input 
                    {...register("number")}
                    placeholder="np. FV/2024/04/01"
                    className="w-full bg-[#141416] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none transition-all"
                  />
                  {errors.number && <p className="text-red-400 text-[10px] mt-1 font-medium">{errors.number.message}</p>}
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#52525b] uppercase tracking-[0.2em] flex items-center gap-2">
                    <DollarSign className="w-3 h-3" /> Kwota (Netto)
                  </label>
                  <div className="relative">
                    <input 
                        type="number"
                        step="0.01"
                        {...register("amount", { valueAsNumber: true })}
                        className="w-full bg-[#141416] border border-[#27272a] rounded-xl pl-4 pr-12 py-3 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none transition-all font-mono"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#52525b]">PLN</span>
                  </div>
                  {errors.amount && <p className="text-red-400 text-[10px] mt-1 font-medium">{errors.amount.message}</p>}
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#52525b] uppercase tracking-[0.2em] flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Termin płatności
                  </label>
                  <input 
                    type="date"
                    {...register("dueDate", { valueAsDate: true })}
                    className="w-full bg-[#141416] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none transition-all"
                  />
                  {errors.dueDate && <p className="text-red-400 text-[10px] mt-1 font-medium">{errors.dueDate.message}</p>}
                </div>
              </div>

              {/* Status */}
              <div className="pt-4 space-y-4">
                 <label className="text-[10px] font-bold text-[#52525b] uppercase tracking-[0.2em]">Status początkowy</label>
                 <div className="flex gap-4">
                    {["DRAFT", "SENT", "PAID"].map((status) => (
                        <label key={status} className="flex-1 cursor-pointer group">
                             <input 
                                type="radio" 
                                value={status} 
                                {...register("status")} 
                                className="sr-only" 
                             />
                             <div className="border border-[#27272a] rounded-xl p-4 text-center group-hover:border-[#a78bfa]/50 transition-all bg-[#09090b]">
                                <span className="text-[10px] font-bold text-[#fafafa] uppercase tracking-widest">{status}</span>
                             </div>
                        </label>
                    ))}
                 </div>
              </div>
            </form>

            {/* Footer */}
            <div className="p-8 border-t border-[#27272a] flex justify-end gap-4 bg-[#141416]/50">
              <button 
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 rounded-2xl text-[10px] font-bold text-[#fafafa] border border-[#27272a] hover:bg-[#0c0c0f] transition-all uppercase tracking-widest"
              >
                Anuluj
              </button>
              <button 
                type="submit"
                form="create-invoice-form"
                disabled={loading}
                className="flex items-center gap-3 bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#09090b] font-bold px-10 py-3 rounded-2xl text-[10px] transition-all shadow-lg uppercase tracking-[0.2em] transform active:scale-95"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {loading ? "Wystawianie..." : "Wystaw Fakturę"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
