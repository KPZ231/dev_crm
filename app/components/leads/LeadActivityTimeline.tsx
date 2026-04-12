"use client";

import { LeadWithDetails } from "@/lib/types/lead";
import { User, MessageSquare, History, Edit, PlusCircle } from "lucide-react";

interface LeadActivityTimelineProps {
  activities: LeadWithDetails["activities"];
}

export function LeadActivityTimeline({ activities }: LeadActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="py-10 text-center text-[#52525b] text-sm">
        Brak aktywności dla tego leada.
      </div>
    );
  }

  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-[#27272a]">
      {activities.map((activity) => (
        <div key={activity.id} className="relative flex items-start gap-6 pl-2">
          <div className="z-10 flex items-center justify-center w-6 h-6 rounded-full bg-[#09090b] border border-[#27272a] mt-1 shrink-0">
            <ActivityIcon action={activity.action} />
          </div>
          <div className="flex-grow space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#fafafa] font-medium text-sm">
                {activity.actor.name || activity.actor.email}
              </span>
              <span className="text-[#a1a1aa] text-xs">
                {new Date(activity.createdAt).toLocaleString("pl-PL")}
              </span>
            </div>
            <div className="text-sm text-[#a1a1aa]">
              {getActivityDescription(activity.action, activity.content)}
            </div>
            {activity.content && activity.action === "NOTE_ADDED" && (
              <div className="mt-2 p-3 bg-[#0c0c0f] border border-[#27272a] rounded-lg text-[#fafafa] text-sm">
                {activity.content}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityIcon({ action }: { action: string }) {
  switch (action) {
    case "CREATED":
      return <PlusCircle className="w-3 h-3 text-[#34d399]" />;
    case "STATUS_CHANGED":
      return <History className="w-3 h-3 text-[#a78bfa]" />;
    case "NOTE_ADDED":
      return <MessageSquare className="w-3 h-3 text-[#facc15]" />;
    case "UPDATED":
      return <Edit className="w-3 h-3 text-[#38bdf8]" />;
    default:
      return <div className="w-1.5 h-1.5 rounded-full bg-[#a1a1aa]" />;
  }
}

function getActivityDescription(action: string, content: string | null) {
  switch (action) {
    case "CREATED":
      return "Utworzył(a) leada";
    case "STATUS_CHANGED":
      return `Zmienił(a) status na: ${content}`;
    case "NOTE_ADDED":
      return "Dodał(a) notatkę";
    case "UPDATED":
      return "Zaktualizował(a) dane leada";
    default:
      return action;
  }
}
