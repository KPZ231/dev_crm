"use client";

import { DocumentTemplateWithCount } from "@/lib/types/document";
import { 
    Layout, 
    Plus, 
    FileCode, 
    ChevronRight, 
    Trash2, 
    Settings
} from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import Link from "next/link";
import { deleteTemplate } from "@/lib/actions/documents";
import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TemplatesManagerProps {
    workspaceId: string;
    templates: DocumentTemplateWithCount[];
}

export function TemplatesManager({ workspaceId, templates }: TemplatesManagerProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = (id: string, name: string) => {
        if (!confirm(`Czy na pewno chcesz trwale usunąć szablon "${name}"?`)) return;

        startTransition(async () => {
            try {
                await deleteTemplate(workspaceId, id);
                toast.success("Szablon usunięty");
            } catch (error) {
                toast.error("Wystąpił błąd");
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-[#fafafa]">Zarządzanie Szablonami</h2>
                    <p className="text-xs text-[#52525b]">Twórz i edytuj wzory dokumentów dla Twojego zespołu</p>
                </div>
                <Link 
                    href="/dashboard/documents/templates/new"
                    className="flex items-center gap-2 bg-[#141416] border border-[#27272a] hover:border-[#a78bfa]/40 text-[#fafafa] px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
                >
                    <Plus className="w-4 h-4" /> Nowy Szablon
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                    <div 
                        key={template.id}
                        className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-6 group hover:border-[#a78bfa]/30 transition-all flex flex-col relative overflow-hidden"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-[#141416] border border-[#27272a] text-[#a78bfa] group-hover:bg-[#a78bfa] group-hover:text-[#09090b] transition-all">
                                <Layout className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Link href={`/dashboard/documents/templates/${template.id}`} className="p-2 text-[#52525b] hover:text-[#fafafa] transition-colors">
                                    <Settings className="w-4 h-4" />
                                </Link>
                                <button 
                                    onClick={() => handleDelete(template.id, template.name)}
                                    disabled={isPending}
                                    className="p-2 text-[#52525b] hover:text-red-400 transition-colors disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-grow z-10 relative">
                            <h4 className="font-bold text-[#fafafa] group-hover:text-[#a78bfa] transition-colors">{template.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-[#52525b] uppercase font-bold tracking-widest">{template.type}</span>
                                <span className="text-[#27272a]">•</span>
                                <span className="text-[10px] text-[#a1a1aa]">{template._count?.documents || 0} użyć</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-[#27272a] flex items-center justify-between z-10 relative">
                            <span className="text-[10px] text-[#52525b]">
                                Aktualizacja: {format(new Date(template.updatedAt), "dd.MM.yyyy", { locale: pl })}
                            </span>
                            <Link href={`/dashboard/documents/templates/${template.id}`} className="text-[#a78bfa] text-xs font-bold flex items-center gap-1 hover:underline">
                                Edytuj kreatorem <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
            
            {templates.length === 0 && (
                <div className="py-20 text-center bg-[#0c0c0f] border border-[#27272a] rounded-2xl border-dashed">
                    <FileCode className="w-12 h-12 text-[#27272a] mx-auto mb-4" />
                    <p className="text-[#52525b] text-sm italic">Nie stworzyłeś jeszcze żadnych szablonów.</p>
                </div>
            )}
        </div>
    );
}
