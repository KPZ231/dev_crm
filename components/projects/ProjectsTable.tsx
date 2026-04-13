"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { deleteProject } from "@/lib/actions/projects";
import { useRouter } from "next/navigation";

// Minimal mockup of project
type ProjectData = any; // TODO: replace with ProjectSummary type

export function ProjectsTable({ data }: { data: ProjectData[] }) {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const filtered = data.filter((project) => 
    project.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    startTransition(async () => {
      await deleteProject(id);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Filter projects..."
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        className="w-full max-w-sm px-3 py-2 bg-[#0c0c0f] border border-[#27272a] rounded-md text-[#fafafa] placeholder:text-[#a1a1aa] focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:border-transparent transition-all sm:text-sm"
      />
      
      <div className="rounded-lg border border-[#27272a] bg-[#0c0c0f] overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#18181b] border-b border-[#27272a] text-[#a1a1aa]">
            <tr>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Client</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Budget</th>
              <th className="p-4 font-medium">Dates</th>
              <th className="p-4 font-medium">Team</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a] relative">
            {filtered.map((project) => (
              <tr key={project.id} className="hover:bg-[#18181b]/50 transition-colors group">
                <td className="p-4 font-medium text-[#fafafa]">
                  <Link href={`/dashboard/projects/${project.id}`} className="hover:text-[#a78bfa] transition-colors">
                    {project.name}
                  </Link>
                </td>
                <td className="p-4 text-[#a1a1aa]">
                  {project.client?.companyName || "Internal"}
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-md border border-[#a78bfa]/30 text-xs font-medium text-[#a78bfa] bg-[#a78bfa]/10">
                    {project.status}
                  </span>
                </td>
                <td className="p-4 text-[#a1a1aa]">
                  {project.budget ? `$${project.budget}` : "-"}
                </td>
                <td className="p-4 text-[#a1a1aa] text-xs">
                  {project.startDate && format(new Date(project.startDate), "MMM d, yyyy")}
                  {" - "}
                  {project.endDate && format(new Date(project.endDate), "MMM d, yyyy")}
                </td>
                <td className="p-4">
                  <div className="flex -space-x-2">
                    {project.members && project.members.slice(0, 3).map((m: any) => (
                      <div 
                        key={m.id} 
                        className="h-7 w-7 rounded-full border border-[#27272a] flex items-center justify-center bg-[#27272a] text-[#fafafa] text-[10px] overflow-hidden"
                      >
                        {m.user?.image ? (
                          <img src={m.user.image} alt={m.user.name || "User"} className="h-full w-full object-cover" />
                        ) : (
                          <span>{m.user?.name?.charAt(0) || "U"}</span>
                        )}
                      </div>
                    ))}
                    {project.members && project.members.length > 3 && (
                      <div className="flex items-center justify-center h-7 w-7 rounded-full bg-[#18181b] border border-[#27272a] text-[10px] text-[#a1a1aa]">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/dashboard/projects/${project.id}/edit`}
                      className="p-1.5 hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] rounded transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      disabled={isPending}
                      onClick={() => handleDelete(project.id)}
                      className="p-1.5 hover:bg-red-500/10 text-[#a1a1aa] hover:text-red-400 rounded transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#a1a1aa]">
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
