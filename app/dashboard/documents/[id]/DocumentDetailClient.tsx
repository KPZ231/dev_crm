"use client";

import { useState, useTransition } from "react";
import { DocumentWithRelations } from "@/lib/types/document";
import { WYSIWYGEditor, EditorDesign } from "@/app/components/documents/WYSIWYGEditor";
import { 
    updateDocumentStatus, 
    exportDocumentToPdf,
    updateDocument
} from "@/lib/actions/documents";
import { DocumentStatus } from "@prisma/client";
import { 
    Send, 
    CheckCircle2, 
    Archive, 
    Download,
    Share2
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DocumentDetailClientProps {
  document: DocumentWithRelations;
  workspaceId: string;
}

export function DocumentDetailClient({ document: initialDoc, workspaceId }: DocumentDetailClientProps) {
  const [document, setDocument] = useState(initialDoc);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Parse initial content safely
  const parsedContent = typeof initialDoc.content === 'string' ? { html: initialDoc.content, design: null } : ((initialDoc.content as any) || { html: "", design: null });

  const handleUpdateStatus = async (status: DocumentStatus) => {
    try {
        const updated = await updateDocumentStatus(workspaceId, document.id, status);
        setDocument((prev: DocumentWithRelations) => ({ ...prev, status: updated.status }));
        toast.success("Zmieniono status dokumentu.");
    } catch {
        toast.error("Błąd podczas aktualizacji statusu.");
    }
  };

  const handleSave = async (payload: { name: string, type: any, content: string, design: EditorDesign }) => {
    startTransition(async () => {
        try {
            await updateDocument(workspaceId, document.id, {
                name: payload.name,
                type: payload.type,
                content: { html: payload.content, design: payload.design }
            });
            toast.success("Dokument zaktualizowany.");
            router.refresh();
        } catch {
            toast.error("Błąd podczas zapisywania.");
        }
    });
  };

  const handleExport = async () => {
    try {
        const { url } = await exportDocumentToPdf(workspaceId, document.id);
        toast.success(`Generowanie PDF... Pobierz tutaj: ${url}`);
    } catch {
        toast.error("Błąd eksportu.");
    }
  };

  const HeaderActions = (
     <>
        <StatusButton 
            active={document.status === 'SENT'} 
            onClick={() => handleUpdateStatus('SENT')}
            icon={<Send className="w-3 h-3" />} 
            label="Wyślij" 
        />
        <StatusButton 
            active={document.status === 'SIGNED'} 
            onClick={() => handleUpdateStatus('SIGNED')}
            icon={<CheckCircle2 className="w-3 h-3" />} 
            label="Podpisano" 
        />
        <StatusButton 
            active={document.status === 'ARCHIVED'} 
            onClick={() => handleUpdateStatus('ARCHIVED')}
            icon={<Archive className="w-3 h-3" />} 
            label="Archiwizuj" 
        />
        <div className="w-px h-6 bg-[#27272a] mx-2" />
        <button 
            onClick={handleExport}
            className="p-2 text-[#a1a1aa] hover:text-[#fafafa] bg-[#141416] border border-[#27272a] rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-3"
        >
            <Download className="w-4 h-4" /> PDF
        </button>
        <button className="p-2 text-[#a1a1aa] hover:text-[#fafafa] bg-[#141416] border border-[#27272a] rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-3">
            <Share2 className="w-4 h-4" />
        </button>
     </>
  );

  return (
    <WYSIWYGEditor
        initialName={document.name}
        initialType={document.type}
        initialContent={parsedContent.html}
        initialDesign={parsedContent.design}
        onSave={handleSave}
        isPending={isPending}
        backUrl="/dashboard/documents"
        readOnlyType={true}
        headerActions={HeaderActions}
    />
  );
}

interface StatusButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

function StatusButton({ active, onClick, icon, label }: StatusButtonProps) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all ${
                active 
                    ? 'bg-[#a78bfa]/10 border-[#a78bfa] text-[#a78bfa]' 
                    : 'bg-[#141416] border-[#27272a] text-[#52525b] hover:text-[#a1a1aa]'
            }`}
        >
            {icon} {label}
        </button>
    );
}
