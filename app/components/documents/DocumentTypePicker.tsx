"use client";

import { DocumentType } from "@prisma/client";
import { 
  FileText, 
  FileSignature, 
  HelpCircle, 
  ShieldCheck, 
  LayoutList 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentTypePickerProps {
  selected: string | null;
  onSelect: (type: DocumentType) => void;
  allowedTypes?: string[];
}

export function DocumentTypePicker({ selected, onSelect, allowedTypes }: DocumentTypePickerProps) {
  const types = [
    { id: "OFFER", label: "Oferta", icon: FileText, desc: "Oferta handlowa lub propozycja współpracy" },
    { id: "CONTRACT", label: "Umowa", icon: FileSignature, desc: "Umowa B2B, umowa o dzieło lub zlecenie" },
    { id: "BRIEF", label: "Brief", icon: HelpCircle, desc: "Wymagania projektowe i założenia" },
    { id: "PROTOCOL", label: "Protokół", icon: ShieldCheck, desc: "Protokół odbioru lub przekazania" },
    { id: "SUMMARY", label: "Podsumowanie", icon: LayoutList, desc: "Raport z prac lub podsumowanie etapu" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {types.map((t) => {
        const isAllowed = !allowedTypes || allowedTypes.includes(t.id);
        const isSelected = selected === t.id;
        
        return (
          <button
            key={t.id}
            type="button"
            disabled={!isAllowed}
            onClick={() => onSelect(t.id as DocumentType)}
            className={cn(
              "flex flex-col items-start p-5 rounded-2xl border transition-all text-left group",
              isSelected 
                ? "bg-[#a78bfa]/10 border-[#a78bfa] shadow-lg shadow-[#a78bfa]/5" 
                : "bg-[#0c0c0f] border-[#27272a] hover:border-[#a78bfa]/40",
              !isAllowed && "opacity-40 cursor-not-allowed grayscale"
            )}
          >
            <div className={cn(
                "p-3 rounded-xl border border-[#27272a] mb-4 transition-colors",
                isSelected ? "bg-[#a78bfa] text-[#09090b] border-[#a78bfa]" : "bg-[#141416] text-[#a78bfa]"
            )}>
                <t.icon className="w-5 h-5" />
            </div>
            <h4 className={cn("text-sm font-bold mb-1", isSelected ? "text-[#a78bfa]" : "text-[#fafafa]")}>{t.label}</h4>
            <p className="text-[10px] text-[#52525b] leading-normal">{t.desc}</p>
          </button>
        );
      })}
    </div>
  );
}
