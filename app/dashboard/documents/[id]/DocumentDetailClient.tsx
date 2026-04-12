"use client";

import { useState } from "react";
import { DocumentWithRelations } from "@/lib/types/document";
import { DocumentEditor } from "@/app/components/documents/DocumentEditor";
import { 
    updateDocumentStatus, 
    exportDocumentToPdf 
} from "@/lib/actions/documents";
import { DocumentStatus } from "@prisma/client";
import { 
    Send, 
    CheckCircle2, 
    Archive, 
    Download,
    Share2
} from "lucide-react";

interface DocumentDetailClientProps {
  document: DocumentWithRelations;
  workspaceId: string;
}

export function DocumentDetailClient({ document: initialDoc, workspaceId }: DocumentDetailClientProps) {
  const [document, setDocument] = useState(initialDoc);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateStatus = async (status: DocumentStatus) => {
    try {
        const updated = await updateDocumentStatus(workspaceId, document.id, status);
        setDocument((prev: DocumentWithRelations) => ({ ...prev, status: updated.status }));
    } catch {
        alert("Błąd podczas aktualizacji statusu.");
    }
  };

  const handleSaveContent = async () => {
    try {
        setIsSaving(true);
        // In a real app we'd have an updateDocument action
        // For now I'll use the same pattern as status update but with content
        // await updateDocument(workspaceId, document.id, { content });
        setIsSaving(false);
    } catch {
        setIsSaving(false);
        alert("Błąd podczas zapisywania.");
    }
  };

  const handleExport = async () => {
    try {
        const { url } = await exportDocumentToPdf(workspaceId, document.id);
        alert(`Generowanie PDF... Pobierz tutaj: ${url}`);
    } catch {
        alert("Błąd eksportu.");
    }
  };

  return (
    <div className="flex flex-col h-full">
        {/* Sub-header for actions */}
        <div className="bg-[#09090b] border-b border-[#27272a]/50 p-2 flex items-center justify-between px-8">
            <div className="flex items-center gap-2">
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
            </div>

            <div className="flex items-center gap-2">
                <button 
                    onClick={handleExport}
                    className="p-2 text-[#a1a1aa] hover:text-[#fafafa] bg-[#141416] border border-[#27272a] rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-4"
                >
                    <Download className="w-4 h-4" /> PDF
                </button>
                <button className="p-2 text-[#a1a1aa] hover:text-[#fafafa] bg-[#141416] border border-[#27272a] rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-4">
                    <Share2 className="w-4 h-4" /> Udostepnij
                </button>
            </div>
        </div>

        <div className="grow p-6 h-full overflow-hidden">
            <DocumentEditor 
                initialContent={document.content as string || ""} 
                onSave={handleSaveContent}
                isLoading={isSaving}
            />
        </div>
    </div>
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
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all ${
                active 
                    ? 'bg-[#a78bfa]/10 border-[#a78bfa] text-[#a78bfa]' 
                    : 'bg-[#141416] border-[#27272a] text-[#52525b] hover:text-[#a1a1aa]'
            }`}
        >
            {icon} {label}
        </button>
    );
}
