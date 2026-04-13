"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, TaskFormValues } from "@/lib/schemas/task";
import { X, Save } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { createTask, updateTask, getTaskFormOptions } from "@/lib/actions/tasks";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { TaskWithRelations } from "@/lib/types/task";

interface TaskCreateModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: TaskStatus;
  initialData?: TaskWithRelations;
}

interface TaskFormOptions {
  projects: { id: string; name: string }[];
  members: { user: { id: string; name: string | null; email: string } }[];
}

export function TaskCreateModal({ workspaceId, isOpen, onClose, defaultStatus = "TODO", initialData }: TaskCreateModalProps) {
  const [options, setOptions] = useState<TaskFormOptions>({ projects: [], members: [] });
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: defaultStatus,
      priority: "MEDIUM",
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          title: initialData.title,
          description: initialData.description,
          status: initialData.status,
          priority: initialData.priority,
          assigneeId: initialData.assigneeId,
          projectId: initialData.projectId,
          dueDate: initialData.dueDate ? new Date(initialData.dueDate) : null,
        });
      } else {
        reset({ status: defaultStatus, priority: "MEDIUM" });
      }
      getTaskFormOptions(workspaceId).then(setOptions).catch(console.error);
    }
  }, [isOpen, workspaceId, defaultStatus, initialData, reset]);

  const onSubmit = async (data: TaskFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await updateTask(workspaceId, initialData.id, data);
      } else {
        await createTask(workspaceId, data);
      }
      reset();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Wystąpił błąd podczas dodawania zadania");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
              <h2 className="text-xl font-bold text-[#fafafa]">{initialData ? "Edytuj zadanie" : "Nowe zadanie"}</h2>
              <button disabled={loading} onClick={onClose} className="p-2 hover:bg-[#141416] rounded-xl transition-colors">
                  <X className="w-5 h-5 text-[#52525b]" />
              </button>
          </div>

          {/* Content */}
          <div className="flex-grow overflow-y-auto p-6 md:p-8 custom-scrollbar">
            <form id="create-task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Title */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-[#fafafa] uppercase tracking-wider">Tytuł zadania</label>
                    <input 
                        {...register("title")}
                        disabled={loading}
                        placeholder="np. Przygotowanie makiety"
                        className="w-full bg-[#141416] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none transition-all"
                    />
                    {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-[#fafafa] uppercase tracking-wider">Opis</label>
                    <textarea 
                        {...register("description")}
                        disabled={loading}
                        placeholder="Szczegóły zadania..."
                        className="w-full bg-[#141416] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none transition-all min-h-[120px] resize-y"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Status */}
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-[#fafafa] uppercase tracking-wider">Status</label>
                      <select 
                          {...register("status")}
                          disabled={loading}
                          className="w-full bg-[#141416] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none transition-all"
                      >
                          {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-[#fafafa] uppercase tracking-wider">Priorytet</label>
                      <select 
                          {...register("priority")}
                          disabled={loading}
                          className="w-full bg-[#141416] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none transition-all"
                      >
                          {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Project */}
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-[#fafafa] uppercase tracking-wider">Projekt</label>
                      <select 
                          {...register("projectId")}
                          disabled={loading}
                          className="w-full bg-[#141416] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none transition-all"
                      >
                          <option value="">Wybierz projekt...</option>
                          {options.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                  </div>

                  {/* Assignee */}
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-[#fafafa] uppercase tracking-wider">Przypisz do</label>
                      <select 
                          {...register("assigneeId")}
                          disabled={loading}
                          className="w-full bg-[#141416] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none transition-all"
                      >
                          <option value="">Nieprzypisane</option>
                          {options.members.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name || m.user.email}</option>)}
                      </select>
                  </div>
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-[#fafafa] uppercase tracking-wider">Termin</label>
                    <input 
                        type="date"
                        {...register("dueDate", { valueAsDate: true })}
                        disabled={loading}
                        className="w-full bg-[#141416] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none transition-all"
                    />
                </div>

            </form>
          </div>

          <div className="p-6 border-t border-[#27272a] flex justify-end gap-3 z-10 bg-[#0c0c0f]">
            <button 
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#fafafa] border border-[#27272a] hover:bg-[#141416] transition-colors"
            >
                Anuluj
            </button>
            <button 
                type="submit"
                form="create-task-form"
                disabled={loading}
                className="flex items-center gap-2 bg-[#a78bfa] hover:bg-[#8b5cf6] disabled:opacity-50 text-[#09090b] font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-lg"
            >
                <Save className="w-4 h-4" /> 
                {loading ? "Zapisywanie..." : (initialData ? "Zapisz zmiany" : "Utwórz zadanie")}
            </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
