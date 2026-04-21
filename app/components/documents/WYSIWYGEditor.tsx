"use client";

import { useState, useRef, useEffect } from "react";
import { DocumentType } from "@prisma/client";
import { 
  ChevronLeft, 
  Save, 
  Settings, 
  Type, 
  Image as ImageIcon,
  PenTool,
  Palette,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { fillTemplate } from "@/lib/document-generator";
import { parseMarkdown } from "@/lib/markdown";

const DEFAULT_DESIGN = {
  primaryColor: "#a78bfa",
  textColor: "#fafafa",
  logoUrl: "",
  signatureData: "",
  fontFamily: "sans-serif"
};

export interface EditorDesign {
  primaryColor: string;
  textColor: string;
  logoUrl: string;
  signatureData: string;
  fontFamily: string;
}

export interface WYSIWYGEditorProps {
  initialName?: string;
  initialType?: DocumentType;
  initialContent?: string;
  initialDesign?: any;
  onSave: (payload: { name: string, type: DocumentType, content: string, design: EditorDesign }) => Promise<void>;
  isPending: boolean;
  backUrl: string;
  readOnlyType?: boolean;
  headerActions?: React.ReactNode;
  variableData?: any;
}

export function WYSIWYGEditor({ 
    initialName = "Nowy Dokument",
    initialType = DocumentType.OFFER,
    initialContent = "<h1>Nagłówek</h1><p>Treść...</p>",
    initialDesign,
    onSave,
    isPending,
    backUrl,
    readOnlyType = false,
    headerActions,
    variableData = {}
}: WYSIWYGEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [formData, setFormData] = useState({
    name: initialName,
    type: initialType,
    content: initialContent,
  });

  // Effect to sync content if initialContent changes (e.g. from template generation)
  useEffect(() => {
    setFormData(prev => ({ ...prev, content: initialContent }));
  }, [initialContent]);

  const [design, setDesign] = useState<EditorDesign>(
    initialDesign ? (typeof initialDesign === 'string' ? JSON.parse(initialDesign) : initialDesign) : DEFAULT_DESIGN
  );

  const [activeTab, setActiveTab] = useState<"content" | "style" | "signature">("content");
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (activeTab === "signature" && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.strokeStyle = design.primaryColor || "#a78bfa";
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            
            if (design.signatureData) {
                const img = new Image();
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                };
                img.src = design.signatureData;
            }
        }
    }
  }, [activeTab, design.primaryColor, design.signatureData]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let clientX, clientY;
    if ('touches' in e as any) {
      clientX = (e as React.TouchEvent).touches[0].clientX;
      clientY = (e as React.TouchEvent).touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let clientX, clientY;
    if ('touches' in e as any) {
      clientX = (e as React.TouchEvent).touches[0].clientX;
      clientY = (e as React.TouchEvent).touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    saveSignature();
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDesign({ ...design, signatureData: "" });
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDesign({ ...design, signatureData: canvas.toDataURL("image/png") });
  };

  const handleSave = () => {
    onSave({ ...formData, design });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-[#09090b]">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-[#27272a] bg-[#0c0c0f] shrink-0">
        <div className="flex items-center gap-4">
          <Link href={backUrl} className="p-2 hover:bg-[#1a1a1c] rounded-lg transition-colors text-[#a1a1aa] hover:text-[#fafafa]">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <input 
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-transparent text-xl font-bold text-[#fafafa] border-none focus:outline-none focus:ring-0 placeholder:text-[#52525b]"
            placeholder="Nazwa dokumentu / szablonu"
          />
        </div>
        
        <div className="flex items-center gap-3">
          {headerActions}
          <select 
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as DocumentType })}
            className="bg-[#141416] border border-[#27272a] rounded-lg px-3 py-1.5 text-xs text-[#fafafa] font-bold uppercase cursor-pointer outline-none"
            title="Typ Szablonu"
            disabled={isPending || readOnlyType}
          >
            {Object.keys(DocumentType).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          
          <button 
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#09090b] px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
            Zapisz
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor Sidebar */}
        <div className="w-80 border-r border-[#27272a] bg-[#0c0c0f] flex flex-col shrink-0">
          <div className="flex items-center border-b border-[#27272a]">
            <button 
              onClick={() => setActiveTab("content")}
              className={cn("flex-1 py-3 text-xs font-semibold uppercase flex items-center justify-center gap-2 transition-colors", activeTab === "content" ? "text-[#a78bfa] border-b-2 border-[#a78bfa]" : "text-[#52525b] hover:text-[#a1a1aa]")}
            >
              <Type className="w-3.5 h-3.5" /> Treść
            </button>
            <button 
              onClick={() => setActiveTab("style")}
              className={cn("flex-1 py-3 text-xs font-semibold uppercase flex items-center justify-center gap-2 transition-colors", activeTab === "style" ? "text-[#a78bfa] border-b-2 border-[#a78bfa]" : "text-[#52525b] hover:text-[#a1a1aa]")}
            >
              <Palette className="w-3.5 h-3.5" /> Wygląd
            </button>
            <button 
              onClick={() => setActiveTab("signature")}
              className={cn("flex-1 py-3 text-xs font-semibold uppercase flex items-center justify-center gap-2 transition-colors", activeTab === "signature" ? "text-[#a78bfa] border-b-2 border-[#a78bfa]" : "text-[#52525b] hover:text-[#a1a1aa]")}
            >
              <PenTool className="w-3.5 h-3.5" /> Podpis
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar space-y-6">
            {activeTab === "content" && (
              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-[#a1a1aa] uppercase mb-2 block tracking-wider">Treść głowna (HTML/Markdown)</label>
                    <textarea 
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full h-80 bg-[#141416] border border-[#27272a] rounded-lg p-3 text-sm text-[#fafafa] focus:ring-1 focus:ring-[#a78bfa] font-mono resize-none"
                        placeholder="<h1>Nagłówek</h1><p>Twój tekst tutaj...</p>"
                    />
                 </div>
                 <div className="p-3 bg-[#1a1a1c] border border-[#27272a] rounded-lg">
                    <h4 className="text-xs font-bold text-[#fafafa] mb-2 flex items-center gap-2"><Settings className="w-3 h-3 text-[#a78bfa]"/> Zmienne tagi</h4>
                    <p className="text-[10px] text-[#a1a1aa] mb-2 leading-relaxed">System automatycznie wstawia wartości ze zmiennych m.in:</p>
                    <ul className="text-[10px] text-[#52525b] space-y-1 font-mono">
                        <li>{`{{companyName}} - Nazwa firmy`}</li>
                        <li>{`{{contactPerson}} - Osoba kontaktowa`}</li>
                        <li>{`{{date}} - Aktualna data`}</li>
                    </ul>
                 </div>
              </div>
            )}
            
            {activeTab === "style" && (
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-[#a1a1aa] uppercase mb-2 block tracking-wider flex items-center gap-2"><ImageIcon className="w-3 h-3"/> Logo URL</label>
                        <input 
                            type="text"
                            value={design.logoUrl}
                            onChange={(e) => setDesign({ ...design, logoUrl: e.target.value })}
                            className="w-full bg-[#141416] border border-[#27272a] rounded-lg p-2.5 text-xs text-[#fafafa] focus:ring-1 focus:ring-[#a78bfa]"
                            placeholder="https://..."
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-[#a1a1aa] uppercase mb-2 block tracking-wider">Kolor Wiodący</label>
                        <div className="flex items-center gap-3">
                            <input 
                                type="color"
                                value={design.primaryColor}
                                onChange={(e) => setDesign({ ...design, primaryColor: e.target.value })}
                                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                            />
                            <span className="text-xs text-[#fafafa] font-mono uppercase">{design.primaryColor}</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-[#a1a1aa] uppercase mb-2 block tracking-wider">Rodzina czcionek</label>
                        <select 
                            value={design.fontFamily}
                            onChange={(e) => setDesign({ ...design, fontFamily: e.target.value })}
                            className="w-full bg-[#141416] border border-[#27272a] rounded-lg p-2.5 text-xs text-[#fafafa] focus:ring-1 focus:ring-[#a78bfa] cursor-pointer"
                        >
                            <option value="sans-serif">System Sans-Serif</option>
                            <option value="serif">Serif (Times New Roman)</option>
                            <option value="monospace">Monospace</option>
                        </select>
                    </div>
                </div>
            )}

            {activeTab === "signature" && (
                <div className="space-y-4">
                    <p className="text-xs text-[#a1a1aa]">Nakreśl podpis który zosanie umieszczony na końcu generowanych dokumentów.</p>
                    <div className="bg-[#141416] border border-[#27272a] rounded-xl overflow-hidden touch-none relative">
                        <canvas 
                            ref={canvasRef}
                            width={280}
                            height={150}
                            className="w-full h-[150px] cursor-crosshair bg-white"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        />
                        {!design.signatureData && !isDrawing && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                <span className="font-mono text-xl text-black">Napisz Tutaj</span>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between items-center">
                        <button 
                            onClick={clearSignature}
                            className="text-xs text-[#52525b] hover:text-[#fafafa] transition-colors"
                        >
                            Wyczyść
                        </button>
                    </div>
                </div>
            )}

          </div>
        </div>

        {/* Live Preview pane */}
        <div className="flex-1 bg-zinc-950 p-8 overflow-y-auto custom-scrollbar flex justify-center">
            <div 
                className="bg-white w-[210mm] min-h-[297mm] shadow-2xl p-16 text-black"
                style={{ fontFamily: design.fontFamily }}
            >
                {/* Header (Logo + Meta conceptually) */}
                <div 
                    className="flex justify-between items-start mb-16 border-b-2 pb-8"
                    style={{ borderColor: design.primaryColor }}
                >
                    {design.logoUrl ? (
                         // eslint-disable-next-line @next/next/no-img-element
                        <img src={design.logoUrl} alt="Logo" className="max-h-16 object-contain" />
                    ) : (
                        <div className="h-16 w-16 bg-gray-100 flex items-center justify-center text-gray-400 text-xs italic">Brak Logo</div>
                    )}
                    <div className="text-right text-sm text-gray-500">
                        <p className="font-bold uppercase" style={{ color: design.primaryColor }}>{formData.type}</p>
                        <p>Warszawa, {new Date().toLocaleDateString('pl-PL')}</p>
                    </div>
                </div>

                {/* Body parsing */}
                <div 
                    className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-black mb-16 break-words"
                    dangerouslySetInnerHTML={{ 
                        __html: parseMarkdown(fillTemplate(formData.content, variableData))
                    }} 
                />

                {/* Footer / Signature */}
                {(design.signatureData) && (
                    <div className="mt-20 pt-8 border-t border-gray-100 flex justify-end">
                        <div className="text-center w-64 border-t-2 pt-2 border-dashed border-gray-300">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={design.signatureData} alt="Podpis" className="h-16 object-contain mx-auto mix-blend-multiply" />
                            <p className="text-xs font-medium text-gray-500 mt-2">Podpis Wystawcy</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
