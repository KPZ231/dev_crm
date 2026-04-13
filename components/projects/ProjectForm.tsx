"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject, updateProject } from "@/lib/actions/projects";
import { createProjectSchema } from "@/lib/schemas/project";
import { z } from "zod";

type ProjectFormData = z.infer<typeof createProjectSchema>;

interface ProjectFormProps {
  initialData?: ProjectFormData & { id: string };
  clients?: { id: string; companyName: string | null }[];
}

export function ProjectForm({ initialData, clients = [] }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProjectFormData>({
    name: initialData?.name || "",
    clientId: initialData?.clientId || "",
    description: initialData?.description || "",
    status: initialData?.status || "PLANNING",
    budget: initialData?.budget || 0,
    budgetType: initialData?.budgetType || "FIXED",
    startDate: initialData?.startDate ? new Date(initialData.startDate) : null,
    endDate: initialData?.endDate ? new Date(initialData.endDate) : null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "budget" ? Number(value) : value || null,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value ? new Date(value) : null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Cleanup empty clientId
      const submissionData = { ...formData };
      if (!submissionData.clientId) {
        submissionData.clientId = null;
      }

      if (initialData?.id) {
        const result = await updateProject(initialData.id, submissionData);
        if (!result.success) throw new Error(result.error);
        router.push(`/dashboard/projects/${initialData.id}`);
      } else {
        const result = await createProject(submissionData as any);
        if (!result.success || !result.project) throw new Error(result.error || "Failed to create project");
        router.push(`/dashboard/projects/${result.project.id}`);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-[#0c0c0f] p-6 rounded-lg border border-[#27272a]">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#a1a1aa] mb-1">Project Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-md text-[#fafafa] placeholder:text-[#3f3f46] focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:border-transparent transition-all sm:text-sm"
          />
        </div>

        <div>
           <label className="block text-sm font-medium text-[#a1a1aa] mb-1">Client</label>
           <select
             name="clientId"
             value={formData.clientId || ""}
             onChange={handleChange}
             className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-md text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:border-transparent transition-all sm:text-sm"
           >
             <option value="">-- Internal Project --</option>
             {clients.map(client => (
               <option key={client.id} value={client.id}>
                 {client.companyName}
               </option>
             ))}
           </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#a1a1aa] mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-md text-[#fafafa] placeholder:text-[#3f3f46] focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:border-transparent transition-all sm:text-sm"
            placeholder="Describe the project scope and goals..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-md text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:border-transparent transition-all sm:text-sm"
            >
              <option value="PLANNING">Planning</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-1">Budget Type</label>
            <select
              name="budgetType"
              value={formData.budgetType || "FIXED"}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-md text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:border-transparent transition-all sm:text-sm"
            >
              <option value="FIXED">Fixed Price</option>
              <option value="HOURLY">Hourly Rate</option>
              <option value="RETAINER">Retainer</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-1">Budget</label>
            <input
              type="number"
              name="budget"
              value={formData.budget || ""}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-md text-[#fafafa] placeholder:text-[#3f3f46] focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:border-transparent transition-all sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
             <label className="block text-sm font-medium text-[#a1a1aa] mb-1">Start Date</label>
             <input
               type="date"
               name="startDate"
               value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ""}
               onChange={handleDateChange}
               className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-md text-[#fafafa] placeholder:text-[#3f3f46] focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:border-transparent transition-all sm:text-sm"
             />
          </div>
          <div>
             <label className="block text-sm font-medium text-[#a1a1aa] mb-1">End Date</label>
             <input
               type="date"
               name="endDate"
               value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ""}
               onChange={handleDateChange}
               className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-md text-[#fafafa] placeholder:text-[#3f3f46] focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:border-transparent transition-all sm:text-sm"
             />
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-[#fafafa] border border-[#27272a] rounded-md hover:bg-[#18181b] transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-[#09090b] bg-[#a78bfa] hover:bg-[#8b5cf6] rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : initialData?.id ? "Save Changes" : "Create Project"}
        </button>
      </div>
    </form>
  );
}
