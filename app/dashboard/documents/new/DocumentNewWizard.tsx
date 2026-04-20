"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DocumentTypePicker } from "@/app/components/documents/DocumentTypePicker";
import { DocumentType } from "@prisma/client";
import { createDocument, generateDocumentFromTemplate } from "@/lib/actions/documents";
import { 
    Layout, 
    Link as LinkIcon, 
    ArrowRight, 
    Sparkles,
    CheckCircle2
} from "lucide-react";

interface BaseEntity {
    id: string;
    companyName: string;
}

interface DocumentNewWizardProps {
  templates: { id: string; name: string; type: string }[];
  clients: BaseEntity[];
  leads: BaseEntity[];
  workspaceId: string;
  userRole: string;
}

export function DocumentNewWizard({ templates, clients, leads, workspaceId, userRole }: DocumentNewWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<DocumentType | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [linkedTo, setLinkedTo] = useState<{ type: 'client' | 'lead'; id: string } | null>(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    try {
      setIsLoading(true);
      
      let initialContent: any = { html: "", design: null };
      if (templateId) {
          // In a real app we'd fetch the entity data first
          const entityData = linkedTo 
            ? (linkedTo.type === 'client' 
              ? clients.find(c => c.id === linkedTo.id) 
              : leads.find(l => l.id === linkedTo.id))
            : undefined;
            
          const gen = await generateDocumentFromTemplate(workspaceId, templateId, entityData || {});
          initialContent = { html: gen.content, design: gen.design };
      }

      const doc = await createDocument(workspaceId, {
        name: name || `${type} - Nowy`,
        type: type!,
        templateId,
        clientId: linkedTo?.type === 'client' ? linkedTo.id : null,
        leadId: linkedTo?.type === 'lead' ? linkedTo.id : null,
        content: initialContent
      });

      router.push(`/dashboard/documents/${doc.id}`);
    } catch (error) {
        console.error(error);
        alert("Wystąpił błąd podczas tworzenia dokumentu.");
    } finally {
        setIsLoading(false);
    }
  };

  const allowedTypes = userRole === 'SALES' ? [DocumentType.OFFER] : undefined;

  return (
    <div className="space-y-12">
      {/* progress */}
      <div className="flex items-center gap-10">
          <StepIndicator current={step} target={1} label="Typ" />
          <div className="grow h-px bg-[#27272a]" />
          <StepIndicator current={step} target={2} label="Konfiguracja" />
          <div className="grow h-px bg-[#27272a]" />
          <StepIndicator current={step} target={3} label="Podsumowanie" />
      </div>

      {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h3 className="text-xl font-bold text-[#fafafa] mb-6">Wybierz rodzaj dokumentu</h3>
             <DocumentTypePicker 
                selected={type} 
                onSelect={(val) => { setType(val); setStep(2); }} 
                allowedTypes={allowedTypes}
             />
          </div>
      )}

      {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <section>
                    <h3 className="text-sm font-bold text-[#fafafa] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Layout className="w-4 h-4 text-[#a78bfa]" /> Szablon
                    </h3>
                    <select 
                        className="w-full bg-[#0c0c0f] border border-[#27272a] rounded-xl p-3 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none"
                        onChange={(e) => setTemplateId(e.target.value || null)}
                        value={templateId || ""}
                    >
                        <option value="">Czysty dokument (bez szablonu)</option>
                        {templates.filter(t => t.type === type).map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </section>

                <section>
                    <h3 className="text-sm font-bold text-[#fafafa] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-[#a78bfa]" /> Powiązanie
                    </h3>
                    <select 
                        className="w-full bg-[#0c0c0f] border border-[#27272a] rounded-xl p-3 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none"
                        onChange={(e) => {
                            const [eType, eId] = e.target.value.split(':');
                            setLinkedTo(eId ? { type: eType as 'client' | 'lead', id: eId } : null);
                        }}
                        value={linkedTo ? `${linkedTo.type}:${linkedTo.id}` : ""}
                    >
                        <option value="">Brak powiązania</option>
                        <optgroup label="Klienci">
                            {clients.map(c => <option key={c.id} value={`client:${c.id}`}>{c.companyName}</option>)}
                        </optgroup>
                        <optgroup label="Leady">
                             {leads.map(l => <option key={l.id} value={`lead:${l.id}`}>{l.companyName}</option>)}
                        </optgroup>
                    </select>
                </section>
             </div>

             <div className="flex justify-between pt-10 border-t border-[#27272a]">
                <button onClick={() => setStep(1)} className="text-xs text-[#52525b] hover:text-[#a1a1aa] font-bold">Wróć</button>
                <button 
                   onClick={() => setStep(3)} 
                   className="flex items-center gap-2 bg-[#a78bfa] text-[#09090b] font-bold px-8 py-3 rounded-xl text-xs"
                >
                    Dalej <ArrowRight className="w-4 h-4" />
                </button>
             </div>
          </div>
      )}

      {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
             <section className="space-y-4">
                <h3 className="text-sm font-bold text-[#fafafa] uppercase tracking-widest">Nazwa dokumentu</h3>
                <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="np: Oferta wdrożenia CRM v1"
                    className="w-full bg-[#0c0c0f] border border-[#27272a] rounded-xl p-4 text-lg text-[#fafafa] focus:border-[#a78bfa] outline-none"
                />
             </section>

             <div className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-6 flex items-start gap-4">
                <div className="p-3 bg-[#a78bfa]/10 rounded-xl text-[#a78bfa]">
                    <Sparkles className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-[#fafafa]">Jesteś gotowy!</h4>
                    <p className="text-xs text-[#52525b] mt-1">Po kliknięciu przycisku poniżej, przeniesiemy Cię do edytora, gdzie będziesz mógł dopracować treść.</p>
                </div>
             </div>

             <div className="flex justify-between pt-10 border-t border-[#27272a]">
                <button onClick={() => setStep(2)} className="text-xs text-[#52525b] hover:text-[#a1a1aa] font-bold">Wróć</button>
                <button 
                   onClick={handleCreate} 
                   disabled={isLoading}
                   className="flex items-center gap-2 bg-[#a78bfa] text-[#09090b] font-bold px-10 py-4 rounded-xl text-sm shadow-xl hover:bg-[#8b5cf6] transition-all"
                >
                    {isLoading ? "Tworzenie..." : "Generuj Dokument"} <CheckCircle2 className="w-5 h-5" />
                </button>
             </div>
          </div>
      )}
    </div>
  );
}

function StepIndicator({ current, target, label }: { current: number; target: number; label: string }) {
    const isActive = current === target;
    const isPast = current > target;

    return (
        <div className="flex flex-col items-center gap-2 min-w-[60px]">
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${
                isActive ? 'bg-[#a78bfa] border-[#a78bfa] text-[#09090b]' : isPast ? 'bg-[#34d399] border-[#34d399] text-[#09090b]' : 'border-[#27272a] text-[#52525b]'
            }`}>
                {isPast ? <CheckCircle2 className="w-5 h-5" /> : target}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-[#a78bfa]' : 'text-[#52525b]'}`}>{label}</span>
        </div>
    );
}
