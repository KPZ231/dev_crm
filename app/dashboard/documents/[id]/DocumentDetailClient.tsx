"use client";

import { useState, useTransition } from "react";
import { DocumentWithRelations } from "@/lib/types/document";
import { WYSIWYGEditor, EditorDesign } from "@/app/components/documents/WYSIWYGEditor";
import { 
    updateDocumentStatus, 
    updateDocument,
    createShareLink
} from "@/lib/actions/documents";
import { DocumentStatus } from "@prisma/client";
import { 
    Send, 
    CheckCircle2, 
    Archive, 
    Download,
    Share2,
    X,
    Copy,
    ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DocumentDetailClientProps {
  document: DocumentWithRelations;
  workspaceId: string;
}

export function DocumentDetailClient({ document: initialDoc, workspaceId }: DocumentDetailClientProps) {
  const [documentState, setDocumentState] = useState(initialDoc);
  const [isPending, startTransition] = useTransition();
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState<{ token: string, level: string } | null>(
    initialDoc.shareToken ? { token: initialDoc.shareToken, level: initialDoc.shareLevel || "VIEW" } : null
  );
  const router = useRouter();

  const handleUpdateStatus = async (status: DocumentStatus) => {
    try {
        const updated = await updateDocumentStatus(workspaceId, documentState.id, status);
        setDocumentState((prev: DocumentWithRelations) => ({ ...prev, status: updated.status }));
        toast.success("Zmieniono status dokumentu.");
    } catch {
        toast.error("Błąd podczas aktualizacji statusu.");
    }
  };

  const handleSave = async (payload: { 
    name: string, 
    type: any, 
    content: string, 
    design: EditorDesign, 
    variables: any, 
    metadata: any 
  }) => {
    startTransition(async () => {
        try {
            await updateDocument(workspaceId, documentState.id, {
                name: payload.name,
                type: payload.type,
                content: payload.content,
                design: payload.design,
                variables: payload.variables,
                metadata: payload.metadata
            });
            toast.success("Dokument zaktualizowany.");
            router.refresh();
        } catch (err) {
            console.error(err);
            toast.error("Błąd podczas zapisywania.");
        }
    });
  };

  const handleCreateShare = async (level: "VIEW" | "EDIT") => {
    try {
        const result = await createShareLink(workspaceId, documentState.id, level);
        setShareLink({ token: result.shareToken, level: result.shareLevel });
        toast.success("Wygenerowano link do udostępniania.");
    } catch {
        toast.error("Błąd podczas generowania linku.");
    }
  };


  const HeaderActions = (
     <>
        <StatusButton 
            active={documentState.status === 'SENT'} 
            onClick={() => handleUpdateStatus('SENT')}
            icon={<Send className="w-3 h-3" />} 
            label="Wyślij" 
        />
        <StatusButton 
            active={documentState.status === 'SIGNED'} 
            onClick={() => handleUpdateStatus('SIGNED')}
            icon={<CheckCircle2 className="w-3 h-3" />} 
            label="Podpisano" 
        />
        <StatusButton 
            active={documentState.status === 'ARCHIVED'} 
            onClick={() => handleUpdateStatus('ARCHIVED')}
            icon={<Archive className="w-3 h-3" />} 
            label="Archiwizuj" 
        />
     </>
  );

  return (
    <>
        <WYSIWYGEditor
            initialName={documentState.name}
            initialType={documentState.type}
            initialContent={documentState.content || ""}
            initialDesign={documentState.design}
            initialVariables={documentState.variables || {}}
            initialMetadata={documentState.metadata || { city: "Warszawa", date: new Date().toISOString().split('T')[0], footer: "" }}
            onSave={handleSave}
            isPending={isPending}
            backUrl="/dashboard/documents"
            readOnlyType={true}
            headerActions={HeaderActions}
            onShareClick={() => setShowShareModal(true)}
            variableData={{
                ...(documentState.client || {}),
                ...(documentState.lead || {}),
                projectName: documentState.project?.name || "",
                documentName: documentState.name,
            }}
        />

        {showShareModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-6 border-b border-[#27272a] flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-[#fafafa]">Udostępnij dokument</h3>
                            <p className="text-xs text-[#52525b]">Wygeneruj publiczny link do dokumentu</p>
                        </div>
                        <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-[#1a1a1c] rounded-lg text-[#52525b] hover:text-[#fafafa]">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {!shareLink ? (
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => handleCreateShare("VIEW")}
                                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-[#27272a] hover:border-[#a78bfa]/40 hover:bg-[#a78bfa]/5 bg-[#141416] transition-all group"
                                >
                                    <div className="p-3 bg-[#0c0c0f] rounded-full group-hover:text-[#a78bfa]"><Share2 className="w-5 h-5" /></div>
                                    <span className="text-xs font-bold uppercase tracking-widest">Tylko Podgląd</span>
                                </button>
                                <button 
                                    onClick={() => handleCreateShare("EDIT")}
                                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-[#27272a] hover:border-[#a78bfa]/40 hover:bg-[#a78bfa]/5 bg-[#141416] transition-all group"
                                >
                                    <div className="p-3 bg-[#0c0c0f] rounded-full group-hover:text-[#a78bfa]"><ExternalLink className="w-5 h-5" /></div>
                                    <span className="text-xs font-bold uppercase tracking-widest">Możliwość Edycji</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-[#141416] rounded-xl border border-[#27272a] space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold uppercase text-[#52525b]">Poziom dostępu</span>
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                                            shareLink.level === "EDIT" ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                                        )}>
                                            {shareLink.level === "EDIT" ? "Edycja" : "Podgląd"}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input 
                                            readOnly 
                                            value={`${window.location.origin}/shared/${shareLink.token}`}
                                            className="flex-1 bg-[#0c0c0f] border border-[#27272a] rounded-lg p-2 text-[10px] font-mono text-[#a1a1aa]"
                                        />
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/shared/${shareLink.token}`);
                                                toast.success("Link skopiowany do schowka.");
                                            }}
                                            className="p-2 bg-[#a78bfa] text-[#09090b] rounded-lg hover:bg-[#8b5cf6] transition-colors"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShareLink(null)}
                                    className="w-full py-2 text-[10px] font-bold uppercase text-[#ef4444] hover:underline"
                                >
                                    Wyłącz udostępnianie / Zmień poziom
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </>
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
