"use client";

import { useState } from "react";
import { Building2, Settings2 } from "lucide-react";
import { WorkspaceSettingsModal } from "./WorkspaceSettingsModal";

interface WorkspaceSettingsButtonProps {
  workspace: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
}

export function WorkspaceSettingsButton({ workspace }: WorkspaceSettingsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-8 flex items-center justify-between group cursor-pointer hover:border-[#a78bfa]/50 transition-all shadow-sm"
        id="open-company-settings"
      >
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center group-hover:bg-[#a78bfa]/10 transition-colors">
            <Building2 className="w-6 h-6 text-[#52525b] group-hover:text-[#a78bfa]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#fafafa]">Ustawienia firmy</h3>
            <p className="text-sm text-[#52525b]">Zmień nazwę agencji, logo i dane rejestrowe</p>
          </div>
        </div>
        <Settings2 className="w-5 h-5 text-[#27272a] group-hover:text-[#fafafa] transition-colors" />
      </div>

      <WorkspaceSettingsModal 
        workspace={workspace}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
