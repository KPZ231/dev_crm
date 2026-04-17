"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectSchema } from "@/lib/schemas/project";
import { ProjectStatus, BudgetType } from "@prisma/client";
import { Loader2, Save } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createProject, updateProject } from "@/lib/actions/projects";
import { z } from "zod";
import { toast } from "sonner";
import { useEffect } from "react";

type ProjectFormValues = z.infer<typeof createProjectSchema>;

interface ProjectFormProps {
  initialData?: ProjectFormValues & { id: string };
  clients?: { id: string; companyName: string | null }[];
}

export function ProjectForm({ initialData, clients = [] }: ProjectFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: initialData?.name || "",
      clientId: initialData?.clientId || preselectedClientId || null,
      description: initialData?.description || "",
      status: initialData?.status || ProjectStatus.PLANNING,
      budget: initialData?.budget || 0,
      budgetType: initialData?.budgetType || BudgetType.FIXED,
      startDate: initialData?.startDate ? new Date(initialData.startDate) : null,
      endDate: initialData?.endDate ? new Date(initialData.endDate) : null,
    },
  });

  useEffect(() => {
    if (preselectedClientId && !initialData) {
      setValue("clientId", preselectedClientId);
    }
  }, [preselectedClientId, setValue, initialData]);

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      if (initialData?.id) {
        const result = await updateProject(initialData.id, data);
        if (!result.success) throw new Error(result.error);
        toast.success("Projekt został zaktualizowany");
        router.push(`/dashboard/projects/${initialData.id}`);
      } else {
        const result = await createProject(data);
        if (!result.success || !result.project) throw new Error(result.error || "Failed to create project");
        toast.success("Projekt został utworzony");
        router.push(`/dashboard/projects/${result.project.id}`);
      }
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Wystąpił błąd podczas zapisywania projektu.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-[#52525b] uppercase tracking-widest">Podstawowe informacje</h3>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#a1a1aa]">Nazwa projektu *</label>
            <input
              {...register("name")}
              className="w-full bg-[#141416] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-[#fafafa] focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] outline-none transition-all"
              placeholder="np. Nowa Platforma E-commerce"
            />
            {errors.name && <p className="text-[10px] text-red-400">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#a1a1aa]">Klient</label>
            <select
              {...register("clientId")}
              className="w-full bg-[#141416] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none transition-all appearance-none"
            >
              <option value="">-- Projekt wewnętrzny --</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.companyName}
                </option>
              ))}
            </select>
            {errors.clientId && <p className="text-[10px] text-red-400">{errors.clientId.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#a1a1aa]">Opis</label>
            <textarea
              {...register("description")}
              className="w-full bg-[#141416] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-[#fafafa] focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] outline-none transition-all resize-none"
              rows={5}
              placeholder="Opisz zakres projektu i główne cele..."
            />
          </div>
        </div>

        {/* Planning & Budget */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-[#52525b] uppercase tracking-widest">Planowanie i Budżet</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#a1a1aa]">Status *</label>
              <select
                {...register("status")}
                className="w-full bg-[#141416] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none transition-all appearance-none"
              >
                {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[#a1a1aa]">Typ budżetu</label>
              <select
                {...register("budgetType")}
                className="w-full bg-[#141416] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none transition-all appearance-none"
              >
                {Object.values(BudgetType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#a1a1aa]">Budżet</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                {...register("budget")}
                className="w-full bg-[#141416] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-[#fafafa] focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] outline-none transition-all"
                placeholder="0.00"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#52525b] text-xs">
                PLN
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#a1a1aa]">Data rozpoczęcia</label>
              <input
                type="date"
                {...register("startDate")}
                className="w-full bg-[#141416] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none transition-all [color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#a1a1aa]">Data zakończenia</label>
              <input
                type="date"
                {...register("endDate")}
                className="w-full bg-[#141416] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none transition-all [color-scheme:dark]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-8 border-t border-[#27272a]">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-lg border border-[#27272a] text-[#a1a1aa] text-sm font-medium hover:bg-[#141416] transition-all"
        >
          Anuluj
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-[#a78bfa] hover:bg-[#8b5cf6] disabled:opacity-50 disabled:cursor-not-allowed text-[#09090b] font-bold px-8 py-2.5 rounded-lg transition-all shadow-lg"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {initialData?.id ? "Zapisz zmiany" : "Utwórz Projekt"}
        </button>
      </div>
    </form>
  );
}
