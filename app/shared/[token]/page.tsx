import { getDocumentByShareToken, updateSharedDocumentByToken } from "@/lib/actions/documents";
import { notFound } from "next/navigation";
import { WYSIWYGEditor } from "@/app/components/documents/WYSIWYGEditor";
import { DocumentType } from "@prisma/client";
import { toast } from "sonner";

export default async function SharedDocumentPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const document = await getDocumentByShareToken(token);

    if (!document) {
        notFound();
    }

    const isEditable = document.shareLevel === "EDIT";

    async function handleSave(payload: any) {
        "use server";
        if (!isEditable) return;
        
        await updateSharedDocumentByToken(token, payload);
    }

    return (
        <main className="min-h-screen bg-[#09090b]">
            <div className="max-w-[1400px] mx-auto">
                <WYSIWYGEditor
                    initialName={document.name}
                    initialType={document.type}
                    initialContent={document.content || ""}
                    initialDesign={document.design}
                    initialVariables={document.variables as any || {}}
                    initialMetadata={document.metadata as any || {}}
                    onSave={handleSave}
                    isPending={false}
                    backUrl="/" 
                    readOnlyType={true}
                    readOnly={!isEditable}
                    variableData={{
                        ...(document.client || {}),
                        ...(document.lead || {}),
                        projectName: document.project?.name || "",
                        documentName: document.name,
                    }}
                />
            </div>
            
        </main>
    );
}
