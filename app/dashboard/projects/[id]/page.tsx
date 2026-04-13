import { getProjectById } from "@/lib/actions/projects";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Pencil, Users, Calendar, DollarSign, Target, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const result = await getProjectById(params.id);
  if (!result.success || !result.project) return { title: "Project Not Found" };
  return { title: `${result.project.name} | CRM` };
}

export default async function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const result = await getProjectById(params.id);
  
  if (!result.success || !result.project) {
    notFound();
  }

  const project = result.project;
  
  const statusColors: Record<string, string> = {
    PLANNING: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    ACTIVE: "bg-green-500/10 text-green-400 border-green-500/30",
    ON_HOLD: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    COMPLETED: "bg-[#a78bfa]/10 text-[#a78bfa] border-[#a78bfa]/30",
    CANCELLED: "bg-red-500/10 text-red-400 border-red-500/30"
  };

  const getInitials = (name?: string | null) => name?.substring(0, 2).toUpperCase() || "U";

  return (
    <div className="flex flex-col h-full bg-[#09090b] overflow-auto">
      {/* Header */}
      <div className="p-6 border-b border-[#27272a] flex items-center justify-between">
        <div>
          <Link 
            href="/dashboard/projects"
            className="inline-flex items-center text-sm text-[#a1a1aa] hover:text-[#fafafa] mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Projects
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-[#fafafa] tracking-tight">{project.name}</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[project.status] || "bg-[#27272a] text-[#a1a1aa]"}`}>
              {project.status.replace("_", " ")}
            </span>
          </div>
          {project.client && (
            <p className="text-[#a1a1aa] text-sm mt-1">Client: {project.client.companyName}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/projects/${project.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] rounded-md transition-colors text-sm font-medium"
          >
            <Pencil className="w-4 h-4" />
            Edit Project
          </Link>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="bg-[#0c0c0f] rounded-lg border border-[#27272a] p-6">
            <h2 className="text-lg font-semibold text-[#fafafa] mb-4">Project Overview</h2>
            <div className="text-[#a1a1aa] text-sm whitespace-pre-wrap mb-6">
              {project.description || "No description provided."}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[#18181b] rounded-lg border border-[#27272a]">
                <div className="flex items-center gap-2 text-[#a1a1aa] mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs uppercase font-semibold">Budget</span>
                </div>
                <p className="text-[#fafafa] font-medium text-lg">
                  {project.budget ? `$${project.budget.toLocaleString()}` : "N/A"}
                  <span className="text-xs text-[#a1a1aa] ml-1 font-normal">({project.budgetType})</span>
                </p>
              </div>
              <div className="p-4 bg-[#18181b] rounded-lg border border-[#27272a]">
                <div className="flex items-center gap-2 text-[#a1a1aa] mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs uppercase font-semibold">Timeline</span>
                </div>
                <p className="text-[#fafafa] font-medium text-sm">
                  {project.startDate ? format(new Date(project.startDate), "MMM d, yyyy") : "TBD"} -<br />
                  {project.endDate ? format(new Date(project.endDate), "MMM d, yyyy") : "TBD"}
                </p>
              </div>
              <div className="p-4 bg-[#18181b] rounded-lg border border-[#27272a]">
                <div className="flex items-center gap-2 text-[#a1a1aa] mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs uppercase font-semibold">Tasks Completed</span>
                </div>
                <p className="text-[#fafafa] font-medium text-lg">
                  {project.tasks?.filter((t: any) => t.status === "DONE").length || 0}
                  <span className="text-sm text-[#a1a1aa] ml-1">/ {project.tasks?.length || 0}</span>
                </p>
              </div>
              <div className="p-4 bg-[#18181b] rounded-lg border border-[#27272a]">
                <div className="flex items-center gap-2 text-[#a1a1aa] mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-xs uppercase font-semibold">Milestones</span>
                </div>
                <p className="text-[#fafafa] font-medium text-lg">
                  {project.milestones?.filter((m: any) => m.completed).length || 0}
                  <span className="text-sm text-[#a1a1aa] ml-1">/ {project.milestones?.length || 0}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Milestones Card */}
          <div className="bg-[#0c0c0f] rounded-lg border border-[#27272a] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#fafafa]">Milestones</h2>
              <button className="text-xs font-medium text-[#a78bfa] hover:text-[#8b5cf6] transition-colors">
                + Add Milestone
              </button>
            </div>
            
            {project.milestones && project.milestones.length > 0 ? (
              <div className="relative border-l border-[#27272a] ml-3 pl-4 space-y-6">
                {project.milestones.map((milestone: any) => (
                  <div key={milestone.id} className="relative">
                    <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-[#0c0c0f] bg-[#27272a]">
                      {milestone.completed && <div className="absolute inset-0 bg-[#34d399] rounded-full" />}
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`text-sm font-medium ${milestone.completed ? "text-[#a1a1aa] line-through" : "text-[#fafafa]"}`}>{milestone.name}</h3>
                        {milestone.description && (
                          <p className="text-xs text-[#a1a1aa] mt-1">{milestone.description}</p>
                        )}
                        <span className="text-xs text-[#a1a1aa] mt-2 block">
                          {milestone.targetDate ? format(new Date(milestone.targetDate), "MMM d, yyyy") : "No due date"}
                        </span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${milestone.completed ? "bg-[#34d399]/10 text-[#34d399]" : "bg-[#27272a] text-[#a1a1aa]"}`}>
                        {milestone.completed ? "Completed" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#a1a1aa] text-sm">
                No milestones defined for this project.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team Settings */}
          <div className="bg-[#0c0c0f] rounded-lg border border-[#27272a] p-6">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-semibold text-[#fafafa] flex items-center gap-2">
                 <Users className="w-5 h-5 text-[#a1a1aa]" />
                 Team Members
               </h2>
               <button className="text-xs font-medium text-[#a78bfa] hover:text-[#8b5cf6] transition-colors">
                 Manage
               </button>
             </div>
             
             <div className="space-y-3">
               {project.members?.map((member: any) => (
                 <div key={member.id} className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#fafafa] text-xs overflow-hidden">
                     {member.user?.image ? (
                       <img src={member.user.image} alt={member.user.name || ""} className="w-full h-full object-cover" />
                     ) : (
                       <span>{getInitials(member.user?.name)}</span>
                     )}
                   </div>
                   <div>
                     <p className="text-sm font-medium text-[#fafafa]">{member.user?.name || member.user?.email}</p>
                     <p className="text-xs text-[#a1a1aa]">{member.role.toLowerCase()}</p>
                   </div>
                 </div>
               ))}
               {(!project.members || project.members.length === 0) && (
                 <p className="text-sm text-[#a1a1aa]">No members assigned.</p>
               )}
             </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-[#0c0c0f] rounded-lg border border-[#27272a] p-6">
             <h2 className="text-lg font-semibold text-[#fafafa] mb-4">Quick Actions</h2>
             <div className="space-y-2">
               <Link href={`/dashboard/tasks?project=${project.id}`} className="block w-full text-center px-4 py-2 border border-[#27272a] hover:bg-[#18181b] text-[#fafafa] rounded-md transition-colors text-sm font-medium">
                 View Tasks
               </Link>
               <Link href={`/dashboard/documents/new?project=${project.id}`} className="block w-full text-center px-4 py-2 border border-[#27272a] hover:bg-[#18181b] text-[#fafafa] rounded-md transition-colors text-sm font-medium">
                 Create Document
               </Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
