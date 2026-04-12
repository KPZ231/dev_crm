"use client";

import { useState } from "react";
import { 
  LayoutDashboard, 
  Briefcase, 
  Receipt, 
  FileText, 
  History 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts?: {
    projects: number;
    invoices: number;
    documents: number;
  };
}

export function ClientTabs({ activeTab, onTabChange, counts }: ClientTabsProps) {
  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "projects", label: "Projects", icon: Briefcase, count: counts?.projects },
    { id: "invoices", label: "Invoices", icon: Receipt, count: counts?.invoices },
    { id: "documents", label: "Documents", icon: FileText, count: counts?.documents },
    { id: "activity", label: "Activity", icon: History },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-[#27272a] overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative whitespace-nowrap",
            activeTab === tab.id 
              ? "text-[#a78bfa]" 
              : "text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#141416]/50"
          )}
        >
          <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-[#a78bfa]" : "text-[#52525b]")} />
          {tab.label}
          {tab.count !== undefined && (
             <span className={cn(
               "ml-1.5 px-1.5 py-0.5 text-[10px] rounded-md border",
               activeTab === tab.id ? "bg-[#a78bfa]/10 border-[#a78bfa]/20 text-[#a78bfa]" : "bg-[#141416] border-[#27272a] text-[#52525b]"
             )}>
               {tab.count}
             </span>
          )}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a78bfa] rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
