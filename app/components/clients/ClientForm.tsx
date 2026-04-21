"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, ClientFormValues } from "@/lib/schemas/client";
import { ClientStatus, PaymentStatus } from "@prisma/client";
import { Loader2, Save } from "lucide-react";

interface ClientFormProps {
  initialData?: Partial<ClientFormValues>;
  onSubmit: (data: ClientFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ClientForm({ initialData, onSubmit, onCancel, isLoading }: ClientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      companyName: "",
      contactPerson: "",
      ...initialData,
    } as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#52525b] uppercase tracking-widest">Informacje o firmie</h3>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#a1a1aa]">Nazwa firmy *</label>
            <input
              {...register("companyName")}
              className="w-full bg-[#141416] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-[#fafafa] focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] outline-none transition-all"
              placeholder="np. Acme Corp"
            />
            {errors.companyName && <p className="text-[10px] text-red-400">{errors.companyName.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#a1a1aa]">NIP (10 cyfr)</label>
            <input
              {...register("nip")}
              className="w-full bg-[#141416] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-[#fafafa] focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] outline-none transition-all"
              placeholder="1234567890"
            />
            {errors.nip && <p className="text-[10px] text-red-400">{errors.nip.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#a1a1aa]">Branża</label>
            <input
              {...register("industry")}
              className="w-full bg-[#141416] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-[#fafafa] focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] outline-none transition-all"
              placeholder="np. Software House"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#a1a1aa]">Strona WWW</label>
            <input
              {...register("website")}
              className="w-full bg-[#141416] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-[#fafafa] focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] outline-none transition-all"
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Contact info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#52525b] uppercase tracking-widest">Kontakt</h3>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#a1a1aa]">Osoba kontaktowa *</label>
            <input
              {...register("contactPerson")}
              className="w-full bg-[#141416] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-[#fafafa] focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] outline-none transition-all"
              placeholder="Jan Kowalski"
            />
            {errors.contactPerson && <p className="text-[10px] text-red-400">{errors.contactPerson.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#a1a1aa]">Email</label>
            <input
              {...register("email")}
              className="w-full bg-[#141416] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-[#fafafa] focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] outline-none transition-all"
              placeholder="email@firma.pl"
            />
            {errors.email && <p className="text-[10px] text-red-400">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#a1a1aa]">Telefon</label>
            <input
              {...register("phone")}
              className="w-full bg-[#141416] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-[#fafafa] focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] outline-none transition-all"
              placeholder="+48..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#a1a1aa]">Adres</label>
            <textarea
              {...register("address")}
              className="w-full bg-[#141416] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-[#fafafa] focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] outline-none transition-all resize-none"
              rows={3}
              placeholder="ul. Długa 1, 00-001 Warszawa"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#27272a]">
        <div className="space-y-2">
          <label className="text-xs font-medium text-[#a1a1aa]">Status relacji *</label>
          <select
            {...register("status")}
            className="w-full bg-[#141416] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-[#fafafa] focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] outline-none transition-all appearance-none"
          >
            {Object.values(ClientStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.status && <p className="text-[10px] text-red-400">{errors.status.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-[#a1a1aa]">Status płatności *</label>
          <select
            {...register("paymentStatus")}
            className="w-full bg-[#141416] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-[#fafafa] focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] outline-none transition-all appearance-none"
          >
            {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.paymentStatus && <p className="text-[10px] text-red-400">{errors.paymentStatus.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-[#a1a1aa]">Notatki</label>
        <textarea
          {...register("notes")}
          className="w-full bg-[#141416] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-[#fafafa] focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] outline-none transition-all resize-none"
          rows={4}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-lg border border-[#27272a] text-[#a1a1aa] text-sm font-medium hover:bg-[#141416] transition-all"
        >
          Anuluj
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#a78bfa] hover:bg-[#8b5cf6] disabled:opacity-50 disabled:cursor-not-allowed text-[#09090b] font-bold px-8 py-2.5 rounded-lg transition-all shadow-lg"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Zapisz Klienta
        </button>
      </div>
    </form>
  );
}
