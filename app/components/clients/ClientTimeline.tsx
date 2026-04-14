"use client";

import { ClientActivity, User } from "@prisma/client";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { 
  PlusCircle, 
  FileEdit, 
  MessageSquare, 
  ArrowRightLeft,
  Calendar,
  Clock 
} from "lucide-react";
import Image from "next/image";

type ActivityWithActor = ClientActivity & {
  actor: Pick<User, "id" | "name" | "email" | "image">;
};

interface ClientTimelineProps {
  activities: ActivityWithActor[];
}

export function ClientTimeline({ activities }: ClientTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="p-10 text-center bg-[#0c0c0f] border border-[#27272a] rounded-xl border-dashed">
        <Clock className="w-10 h-10 text-[#27272a] mx-auto mb-3" />
        <p className="text-[#52525b] text-sm">Brak historii aktywności.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#27272a] before:via-[#27272a] before:to-transparent">
      {activities.map((activity) => (
        <div key={activity.id} className="relative flex items-start gap-6 group">
          {/* Icon / Marker */}
          <div className="sticky top-0 mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0c0c0f] border border-[#27272a] shadow-xl group-hover:border-[#a78bfa]/50 transition-colors z-10">
            {getActivityIcon(activity.action)}
          </div>

          {/* Content */}
          <div className="flex-grow pb-8 border-b border-[#27272a]/50 group-last:border-0 group-last:pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#fafafa] uppercase tracking-tight">
                  {activity.action.replace("_", " ")}
                </span>
                <span className="text-[#27272a]">•</span>
                <div className="flex items-center gap-2">
                    {activity.actor.image ? (
                        <Image 
                            src={activity.actor.image} 
                            alt={activity.actor.name || ""} 
                            width={20} 
                            height={20} 
                            className="rounded-full border border-[#27272a]"
                        />
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-[#141416] border border-[#27272a] flex items-center justify-center text-[10px] text-[#a1a1aa]">
                            {activity.actor.name?.substring(0, 1) || "U"}
                        </div>
                    )}
                    <span className="text-xs text-[#a1a1aa] font-medium">{activity.actor.name || activity.actor.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[#52525b] font-mono">
                <Calendar className="w-3 h-3" />
                {format(new Date(activity.createdAt), "dd MMM yyyy, HH:mm", { locale: pl })}
              </div>
            </div>

            <div className="bg-[#141416]/50 border border-[#27272a] rounded-lg p-4">
               <p className="text-sm text-[#a1a1aa] leading-relaxed">
                 {activity.content || "Brak dodatkowej treści."}
               </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function getActivityIcon(action: string) {
  switch (action) {
    case "CREATED":
      return <PlusCircle className="w-5 h-5 text-[#a78bfa]" />;
    case "UPDATED":
      return <FileEdit className="w-5 h-5 text-sky-400" />;
    case "NOTE_ADDED":
      return <MessageSquare className="w-5 h-5 text-[#34d399]" />;
    case "STATUS_CHANGED":
      return <ArrowRightLeft className="w-5 h-5 text-orange-400" />;
    default:
      return <Activity className="w-5 h-5 text-[#52525b]" />;
  }
}

function Activity({ className }: { className?: string }) {
    return <Clock className={className} />
}
