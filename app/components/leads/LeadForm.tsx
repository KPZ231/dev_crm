"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LeadStatus, User } from "@prisma/client";
import { leadSchema, LeadFormValues } from "@/lib/schemas/lead";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface LeadFormProps {
  initialData?: Partial<LeadFormValues> & { id?: string };
  users: Pick<User, "id" | "name" | "email">[];
  onSubmit: (data: LeadFormValues) => Promise<any>;
}

export function LeadForm({ initialData, users, onSubmit }: LeadFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      companyName: initialData?.companyName || "",
      contactPerson: initialData?.contactPerson || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      source: initialData?.source || "",
      status: initialData?.status || LeadStatus.NEW,
      potentialValue: initialData?.potentialValue || 0,
      notes: initialData?.notes || "",
      assigneeId: initialData?.assigneeId || "",
    },
  });

  const handleFormSubmit = async (data: LeadFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(data);
    } catch (err: any) {
      setError(err.message || "Wystąpił błąd podczas zapisywania leada.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#a1a1aa]">Nazwa firmy *</label>
          <input
            {...register("companyName")}
            className="w-full bg-[#0c0c0f] border border-[#27272a] rounded-lg px-4 py-2 text-[#fafafa] focus:ring-2 focus:ring-[#a78bfa] transition-all"
            placeholder="np. Awesome Corp"
          />
          {errors.companyName && <p className="text-xs text-red-500">{errors.companyName.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#a1a1aa]">Osoba kontaktowa *</label>
          <input
            {...register("contactPerson")}
            className="w-full bg-[#0c0c0f] border border-[#27272a] rounded-lg px-4 py-2 text-[#fafafa] focus:ring-2 focus:ring-[#a78bfa] transition-all"
            placeholder="Imię i Nazwisko"
          />
          {errors.contactPerson && <p className="text-xs text-red-500">{errors.contactPerson.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#a1a1aa]">Email</label>
          <input
            {...register("email")}
            type="email"
            className="w-full bg-[#0c0c0f] border border-[#27272a] rounded-lg px-4 py-2 text-[#fafafa] focus:ring-2 focus:ring-[#a78bfa] transition-all"
            placeholder="email@przyklad.pl"
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#a1a1aa]">Telefon</label>
          <input
            {...register("phone")}
            className="w-full bg-[#0c0c0f] border border-[#27272a] rounded-lg px-4 py-2 text-[#fafafa] focus:ring-2 focus:ring-[#a78bfa] transition-all"
            placeholder="+48 ..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#a1a1aa]">Źródło</label>
          <input
            {...register("source")}
            className="w-full bg-[#0c0c0f] border border-[#27272a] rounded-lg px-4 py-2 text-[#fafafa] focus:ring-2 focus:ring-[#a78bfa] transition-all"
            placeholder="np. LinkedIn, Polecenie"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#a1a1aa]">Status</label>
          <select
            {...register("status")}
            className="w-full bg-[#0c0c0f] border border-[#27272a] rounded-lg px-4 py-2 text-[#fafafa] focus:ring-2 focus:ring-[#a78bfa] transition-all cursor-pointer"
          >
            {Object.values(LeadStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#a1a1aa]">Wartość potencjalna (PLN)</label>
          <input
            {...register("potentialValue")}
            type="number"
            step="0.01"
            className="w-full bg-[#0c0c0f] border border-[#27272a] rounded-lg px-4 py-2 text-[#fafafa] focus:ring-2 focus:ring-[#a78bfa] transition-all"
          />
          {errors.potentialValue && <p className="text-xs text-red-500">{errors.potentialValue.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#a1a1aa]">Przypisz do</label>
          <select
            {...register("assigneeId")}
            className="w-full bg-[#0c0c0f] border border-[#27272a] rounded-lg px-4 py-2 text-[#fafafa] focus:ring-2 focus:ring-[#a78bfa] transition-all cursor-pointer"
          >
            <option value="">Nieprzypisany</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[#a1a1aa]">Notatki</label>
        <textarea
          {...register("notes")}
          rows={4}
          className="w-full bg-[#0c0c0f] border border-[#27272a] rounded-lg px-4 py-2 text-[#fafafa] focus:ring-2 focus:ring-[#a78bfa] transition-all resize-none"
          placeholder="Dodatkowe informacje o leadzie..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[#27272a]">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
        >
          Anuluj
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#09090b] font-semibold px-8 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {initialData?.id ? "Zapisz zmiany" : "Utwórz lead"}
        </button>
      </div>
    </form>
  );
}
