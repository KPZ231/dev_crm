import { getCachedProjects } from "@/lib/data/projects";
import { ProjectsTable } from "@/components/projects/ProjectsTable";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Projects | CRM",
};

export default async function ProjectsPage() {
  const projects = await getCachedProjects();


  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      <div className="p-6 border-b border-[#27272a] flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#fafafa] tracking-tight">Projects</h1>
          <p className="text-[#a1a1aa] text-sm">Manage your projects, budgets and teams.</p>
        </div>
        
        <Link
          href="/dashboard/projects/new"
          className="flex items-center gap-2 bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#09090b] font-semibold px-4 py-2 rounded-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      <div className="grow overflow-auto p-6">
        <ProjectsTable data={projects} />
      </div>
    </div>
  );
}
