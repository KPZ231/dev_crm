"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { DocumentType } from "@prisma/client";
import { createTemplate, updateTemplate } from "@/lib/actions/documents";
import { toast } from "sonner";
import { WYSIWYGEditor, EditorDesign } from "./WYSIWYGEditor";

interface TemplateBuilderProps {
  workspaceId: string;
  initialData?: Record<string, unknown>;
}

export function TemplateBuilderClient({ workspaceId, initialData }: TemplateBuilderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const handleSave = async (payload: { name: string, type: DocumentType, content: string, design: EditorDesign }) => {
    startTransition(async () => {
      try {
        if (initialData?.id) {
            await updateTemplate(workspaceId, initialData.id, payload);
            toast.success("Szablon zaktualizowany");
        } else {
            await createTemplate(workspaceId, payload);
            toast.success("Szablon utworzony");
            router.push("/dashboard/documents/templates");
        }
      } catch (error) {
        toast.error("Wystąpił błąd podczas zapisywania");
        console.error(error);
      }
    });
  };

  return (
    <WYSIWYGEditor 
        initialName={initialData?.name || "Nowy Szablon"}
        initialType={initialData?.type || DocumentType.OFFER}
        initialContent={initialData?.content || "<h1>Tytuł Szablonu</h1><p>Treść szablonu...</p>"}
        initialDesign={initialData?.design}
        onSave={handleSave}
        isPending={isPending}
        backUrl="/dashboard/documents/templates"
    />
  );
}
