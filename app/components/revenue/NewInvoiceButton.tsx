"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { InvoiceCreateModal } from "./InvoiceCreateModal";

export function NewInvoiceButton({ workspaceId }: { workspaceId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#09090b] font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-lg active:scale-95"
      >
        <Plus className="w-4 h-4" /> Nowa Faktura
      </button>

      <InvoiceCreateModal 
        workspaceId={workspaceId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
