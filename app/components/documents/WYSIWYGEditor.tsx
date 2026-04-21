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
  Loader2,
  Bold,
  Italic,
  List,
  Heading1,
  Heading2,
  Copy,
  Upload,
  X,
  FileText,
  Share2,
  Printer,
  Download,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { fillTemplate } from "@/lib/document-generator";
import { parseMarkdown } from "@/lib/markdown";

const DEFAULT_DESIGN = {
  primaryColor: "#a78bfa",
  textColor: "#fafafa",
  logoUrl: "",
  signatureData: "",
  fontFamily: "Inter, sans-serif"
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
  initialDesign?: Record<string, unknown>;
  initialVariables?: Record<string, unknown>;
  initialMetadata?: { city?: string, date?: string, footer?: string };
  onSave: (payload: { name: string, type: DocumentType, content: string, design: EditorDesign, variables: Record<string, unknown>, metadata: { city?: string, date?: string, footer?: string } }) => Promise<void>;
  isPending: boolean;
  backUrl: string;
  readOnlyType?: boolean;
  readOnly?: boolean;
  headerActions?: React.ReactNode;
  variableData?: Record<string, unknown>; // Global context data (e.g. from DB)
  onDownloadPdf?: () => void;
  onShareClick?: () => void;
}

const extractVariables = (content: string) => {
  const regex = /{{(.*?)}}/g;
  const matches = content.match(regex) || [];
  return Array.from(new Set(matches.map(m => m.replace(/{{|}}/g, "")))).filter(v => v.trim() !== "");
};

export function WYSIWYGEditor({ 
    initialName = "Nowy Dokument",
    initialType = DocumentType.OFFER,
    initialContent = "# Nagłówek\n\nTreść...",
    initialDesign,
    initialVariables = {},
    initialMetadata = { city: "Warszawa", date: new Date().toISOString().split('T')[0], footer: "" },
    onSave,
    isPending,
    backUrl,
    readOnlyType = false,
    readOnly = false,
    headerActions,
    variableData = {},
    onDownloadPdf,
    onShareClick
}: WYSIWYGEditorProps) {
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const textareaRef = useRef<HTMLTextAreaElement>(null);
   const previewRef = useRef<HTMLDivElement>(null);

  
  const [formData, setFormData] = useState({
    name: initialName,
    type: initialType,
    content: typeof initialContent === 'string' ? initialContent : (initialContent as Record<string, unknown>)?.html || "",
  });

  const [variables, setVariables] = useState<Record<string, unknown>>(initialVariables);
  const [metadata, setMetadata] = useState(initialMetadata);
  const [activeTab, setActiveTab] = useState<"content" | "variables" | "style" | "signature">("content");
  const [isDrawing, setIsDrawing] = useState(false);

  // Auto-extract and sync variables
  useEffect(() => {
    const found = extractVariables(formData.content);
    const newVars = { ...variables };
    let changed = false;
    found.forEach(v => {
        if (newVars[v] === undefined) {
            newVars[v] = variableData[v] || "";
            changed = true;
        }
    });
    if (changed) setVariables(newVars);
  }, [formData.content, variableData, variables]);

  useEffect(() => {
    setFormData(prev => ({
        ...prev,
        content: typeof initialContent === 'string' ? initialContent : (initialContent as Record<string, unknown>)?.html || ""
    }));
  }, [initialContent]);

  const [design, setDesign] = useState<EditorDesign>(
    initialDesign ? (typeof initialDesign === 'string' ? JSON.parse(initialDesign) : initialDesign) : DEFAULT_DESIGN
  );

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
    if ('touches' in e) {
      clientX = (e as React.TouchEvent<HTMLCanvasElement>).touches[0].clientX;
      clientY = (e as React.TouchEvent<HTMLCanvasElement>).touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent<HTMLCanvasElement>).clientX;
      clientY = (e as React.MouseEvent<HTMLCanvasElement>).clientY;
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
    if ('touches' in e) {
      clientX = (e as React.TouchEvent<HTMLCanvasElement>).touches[0].clientX;
      clientY = (e as React.TouchEvent<HTMLCanvasElement>).touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent<HTMLCanvasElement>).clientX;
      clientY = (e as React.MouseEvent<HTMLCanvasElement>).clientY;
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
     onSave({ ...formData, design, variables, metadata });
   };

   const insertText = (before: string, after: string = "") => {
     const textarea = textareaRef.current;
     if (!textarea) return;

     const start = textarea.selectionStart;
     const end = textarea.selectionEnd;
     const text = textarea.value;
     const beforeText = text.substring(0, start);
     const middleText = text.substring(start, end);
     const afterText = text.substring(end);

     const newContent = `${beforeText}${before}${middleText}${after}${afterText}`;
     setFormData({ ...formData, content: newContent });

     // Reset focus and selection
     setTimeout(() => {
       textarea.focus();
       const newPos = start + before.length + middleText.length;
       textarea.setSelectionRange(newPos, newPos);
     }, 0);
   };

   const handlePrint = () => {
     window.print();
   };

   const handleDownloadPDF = async () => {
     if (onDownloadPdf) {
        onDownloadPdf();
        return;
     }

     try {
       toast.info("Generowanie pliku PDF pobierania...");
       // Dynamically import to avoid SSR issues
       const html2pdf = (await import('html2pdf.js')).default;
       
       const element = previewRef.current;
       if (!element) return;
       
       const opt = {
         margin:       0,
         filename:     `${formData.name || 'dokument'}.pdf`,
         image:        { type: 'jpeg', quality: 0.98 },
         html2canvas:  { scale: 2, useCORS: true },
         jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
       };

       await html2pdf().set(opt).from(element).save();
       toast.success("Plik PDF został pomyślnie pobrany.");
     } catch (e) {
       console.error("PDF generation error:", e);
       toast.error("Wystąpił błąd podczas generowania pliku PDF.");
     }
   };


  const mergedVariables = { ...(variableData || {}), ...(variables || {}) };
  const renderedContent = parseMarkdown(fillTemplate(formData.content, mergedVariables));

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-[#09090b] print:h-auto print:bg-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-[#27272a] bg-[#0c0c0f] shrink-0 print:hidden">
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
            disabled={readOnly}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#141416] border border-[#27272a] rounded-lg p-0.5 mr-2">
            <button onClick={handlePrint} className="p-2 hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] rounded transition-colors" title="Drukuj">
                <Printer className="w-4 h-4" />
            </button>
            <button onClick={handleDownloadPDF} className="p-2 hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] rounded transition-colors" title="Pobierz PDF">
                <Download className="w-4 h-4" />
            </button>
            <button onClick={onShareClick} className="p-2 hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] rounded transition-colors" title="Udostępnij" disabled={readOnly}>
                <Share2 className="w-4 h-4" />
            </button>
          </div>

          {headerActions}
          <select 
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as DocumentType })}
            className="bg-[#141416] border border-[#27272a] rounded-lg px-3 py-1.5 text-xs text-[#fafafa] font-bold uppercase cursor-pointer outline-none"
            title="Typ Dokumentu"
            disabled={isPending || readOnlyType}
          >
            {Object.keys(DocumentType).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          
          <button 
            onClick={handleSave}
            disabled={isPending || readOnly}
            className="flex items-center gap-2 bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#09090b] px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
            Zapisz
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden print:overflow-visible">
        {/* Editor Sidebar */}
        <div className="w-80 border-r border-[#27272a] bg-[#0c0c0f] flex flex-col shrink-0 print:hidden">
          <div className="flex items-center border-b border-[#27272a]">
            <button 
              onClick={() => setActiveTab("content")}
              className={cn("flex-1 py-3 text-xs font-semibold uppercase flex items-center justify-center gap-2 transition-colors", activeTab === "content" ? "text-[#a78bfa] border-b-2 border-[#a78bfa]" : "text-[#52525b] hover:text-[#a1a1aa]")}
            >
              <Type className="w-3.5 h-3.5" /> Tekst
            </button>
            <button 
              onClick={() => setActiveTab("variables")}
              className={cn("flex-1 py-3 text-xs font-semibold uppercase flex items-center justify-center gap-2 transition-colors", activeTab === "variables" ? "text-[#a78bfa] border-b-2 border-[#a78bfa]" : "text-[#52525b] hover:text-[#a1a1aa]")}
            >
              <Settings className="w-3.5 h-3.5" /> Dane
            </button>
            <button 
              onClick={() => setActiveTab("style")}
              className={cn("flex-1 py-3 text-xs font-semibold uppercase flex items-center justify-center gap-2 transition-colors", activeTab === "style" ? "text-[#a78bfa] border-b-2 border-[#a78bfa]" : "text-[#52525b] hover:text-[#a1a1aa]")}
            >
              <Palette className="w-3.5 h-3.5" /> Styl
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
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-[#a1a1aa] uppercase mb-2 block tracking-wider">Edytor Markdown</label>
                    
                    {/* Toolbar */}
                    <div className="flex items-center gap-1 p-1 bg-[#141416] border border-[#27272a] rounded-t-lg border-b-0">
                        <ToolbarButton onClick={() => insertText('# ')} icon={<Heading1 className="w-3 h-3" />} title="Nagłówek 1" />
                        <ToolbarButton onClick={() => insertText('## ')} icon={<Heading2 className="w-3 h-3" />} title="Nagłówek 2" />
                        <div className="w-px h-3 bg-[#27272a] mx-1" />
                        <ToolbarButton onClick={() => insertText('**', '**')} icon={<Bold className="w-3 h-3" />} title="Pogrubienie" />
                        <ToolbarButton onClick={() => insertText('*', '*')} icon={<Italic className="w-3 h-3" />} title="Kursywa" />
                        <ToolbarButton onClick={() => insertText('- ')} icon={<List className="w-3 h-3" />} title="Lista" />
                    </div>

                    <textarea 
                        ref={textareaRef}
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full h-[450px] bg-[#0c0c0f] border border-[#27272a] rounded-b-lg p-3 text-sm text-[#fafafa] focus:ring-1 focus:ring-[#a78bfa] font-mono resize-none outline-none transition-all"
                        placeholder="# Treść dokumentu..."
                        disabled={readOnly}
                    />
                 </div>
              </div>
            )}

            {activeTab === "variables" && (
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-[#a1a1aa] uppercase mb-4 block tracking-wider">Metadane Dokumentu</label>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <span className="text-[10px] text-[#52525b] uppercase font-bold">Miejscowość</span>
                                <input 
                                    type="text" 
                                    value={metadata.city}
                                    onChange={(e) => setMetadata({ ...metadata, city: e.target.value })}
                                    className="w-full bg-[#141416] border border-[#27272a] rounded-lg p-2 text-xs text-[#fafafa] focus:ring-1 focus:ring-[#a78bfa]"
                                    disabled={readOnly}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <span className="text-[10px] text-[#52525b] uppercase font-bold">Data Wystawienia</span>
                                <input 
                                    type="date" 
                                    value={metadata.date}
                                    onChange={(e) => setMetadata({ ...metadata, date: e.target.value })}
                                    className="w-full bg-[#141416] border border-[#27272a] rounded-lg p-2 text-xs text-[#fafafa] focus:ring-1 focus:ring-[#a78bfa]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <span className="text-[10px] text-[#52525b] uppercase font-bold">Stopka (opcjonalnie)</span>
                                <textarea 
                                    value={metadata.footer}
                                    onChange={(e) => setMetadata({ ...metadata, footer: e.target.value })}
                                    className="w-full bg-[#141416] border border-[#27272a] rounded-lg p-2 text-xs text-[#fafafa] focus:ring-1 focus:ring-[#a78bfa] h-20 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-[#a1a1aa] uppercase mb-4 block tracking-wider">Zmienne w tekście</label>
                        <div className="space-y-4">
                            {Object.keys(variables).length > 0 ? (
                                Object.keys(variables).map(key => (
                                    <div key={key} className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-mono text-[#a78bfa]">{`{{${key}}}`}</span>
                                        </div>
                                        <input 
                                            type="text" 
                                            value={variables[key]}
                                            onChange={(e) => setVariables({ ...variables, [key]: e.target.value })}
                                            className="w-full bg-[#141416] border border-[#27272a] rounded-lg p-2 text-xs text-[#fafafa] focus:ring-1 focus:ring-[#a78bfa]"
                                            placeholder={`Wartość dla ${key}...`}
                                            disabled={readOnly}
                                        />
                                    </div>
                                ))
                            ) : (
                                <p className="text-[10px] text-[#52525b] italic">Brak zmiennych w tekście. Dodaj np. {"{{nazwa}}"}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === "style" && (
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-[#a1a1aa] uppercase mb-2 block tracking-wider flex items-center justify-between">
                            <span className="flex items-center gap-2"><ImageIcon className="w-3 h-3"/> Logo Dokumentu</span>
                            {design.logoUrl && (
                                <button 
                                    onClick={() => setDesign({ ...design, logoUrl: "" })}
                                    className="text-[10px] text-[#ef4444] hover:underline flex items-center gap-1"
                                >
                                    <X className="w-2.5 h-2.5" /> Usuń
                                </button>
                            )}
                        </label>
                        
                        {design.logoUrl ? (
                            <div className="relative group rounded-lg overflow-hidden border border-[#27272a] bg-[#0c0c0f] p-4 text-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={design.logoUrl} alt="Logo preview" className="max-h-20 mx-auto object-contain" />
                                <div className="absolute inset-0 bg-[#09090b]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                     <button 
                                        onClick={() => document.getElementById('logo-upload')?.click()}
                                        className="text-xs font-bold text-[#fafafa] bg-[#a78bfa] px-3 py-1.5 rounded-lg"
                                    >
                                        Zmień logo
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={() => document.getElementById('logo-upload')?.click()}
                                className="w-full h-32 border-2 border-dashed border-[#27272a] hover:border-[#a78bfa]/40 rounded-xl flex flex-col items-center justify-center gap-2 transition-all bg-[#0c0c0f] group"
                            >
                                <div className="p-3 bg-[#141416] rounded-full text-[#52525b] group-hover:text-[#a78bfa] transition-colors">
                                    <Upload className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-[#52525b] uppercase tracking-widest group-hover:text-[#a1a1aa]">Wgraj Logo</span>
                            </button>
                        )}

                        <input 
                            id="logo-upload"
                            type="file"
                            className="hidden"
                            accept="image/png, image/jpeg, image/x-icon"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 1024 * 1024) {
                                    toast.error("Plik jest za duży (max 1MB)");
                                    return;
                                }
                                const reader = new FileReader();
                                reader.onload = (prev) => {
                                    setDesign({ ...design, logoUrl: prev.target?.result as string });
                                };
                                reader.readAsDataURL(file);
                            }}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-[#a1a1aa] uppercase mb-2 block tracking-wider">Akcent Kolorystyczny</label>
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
                        <label className="text-xs font-bold text-[#a1a1aa] uppercase mb-2 block tracking-wider">Czcionka</label>
                        <select 
                            value={design.fontFamily}
                            onChange={(e) => setDesign({ ...design, fontFamily: e.target.value })}
                            className="w-full bg-[#141416] border border-[#27272a] rounded-lg p-2.5 text-xs text-[#fafafa] outline-none cursor-pointer"
                        >
                            <option value="Inter, sans-serif">Inter (Modern)</option>
                            <option value="serif">Times New Roman (Classic)</option>
                            <option value="monospace">JetBrains Mono (Technical)</option>
                        </select>
                    </div>
                </div>
            )}

            {activeTab === "signature" && (
                <div className="space-y-4">
                    <p className="text-xs text-[#a1a1aa]">Nakreśl podpis który zostanie umieszczony pod dokumentem.</p>
                    <div className="bg-white border border-[#27272a] rounded-xl overflow-hidden touch-none relative">
                        <canvas 
                            ref={canvasRef}
                            width={280}
                            height={150}
                            className="w-full h-[150px] cursor-crosshair"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        />
                        {!design.signatureData && !isDrawing && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                                <span className="font-mono text-xl text-black">Podpisz się tutaj</span>
                            </div>
                        )}
                    </div>
                    <button onClick={clearSignature} className="text-xs text-[#52525b] hover:text-[#ef4444] transition-colors">Wyczyść podpis</button>
                </div>
            )}

          </div>
        </div>

        {/* Paged Live Preview (A4 Stack) */}
        <div className="flex-1 bg-zinc-950 p-12 overflow-y-auto custom-scrollbar flex flex-col items-center gap-12 print:bg-white print:p-0 print:overflow-visible">
            <div 
                ref={previewRef}
                className="bg-white w-[210mm] min-h-[297mm] shadow-[0_0_50px_rgba(0,0,0,0.5)] p-20 text-black flex flex-col relative print:shadow-none print:w-full print:min-h-0 print:p-10"
                style={{ fontFamily: design.fontFamily }}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-20 border-b-2 pb-8" style={{ borderColor: design.primaryColor }}>
                    {design.logoUrl ? (
                        <img src={design.logoUrl} alt="Logo" className="max-h-20 object-contain" />
                    ) : (
                        <div className="h-16 w-16 bg-zinc-50 border border-zinc-100 flex items-center justify-center text-[10px] text-zinc-300 italic uppercase tracking-tighter">Brak Logo</div>
                    )}
                    <div className="text-right">
                        <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: design.primaryColor }}>{formData.type}</p>
                        <h2 className="text-lg font-bold mb-2">{formData.name}</h2>
                        <div className="text-[11px] text-zinc-500 font-medium">
                            <p>{metadata.city}, {metadata.date}</p>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div 
                    className="prose prose-zinc max-w-none prose-headings:font-bold prose-headings:text-black prose-p:text-zinc-800 flex-1 break-words"
                    dangerouslySetInnerHTML={{ __html: renderedContent }} 
                />

                {/* Footer / Signature Section */}
                <div className="mt-20 flex justify-between items-end">
                    <div className="flex-1 text-[10px] text-zinc-400 max-w-md whitespace-pre-wrap">
                        {metadata.footer}
                    </div>
                    
                    {design.signatureData && (
                        <div className="text-center w-64 border-t border-dashed border-zinc-200 pt-4">
                            <img src={design.signatureData} alt="Podpis" className="h-20 object-contain mx-auto mix-blend-multiply" />
                            <p className="text-[10px] font-bold text-zinc-400 mt-2 uppercase tracking-widest">Podpis Wystawcy</p>
                        </div>
                    )}
                </div>

                {/* A4 Page Indicator (visual only in editor) */}
                <div className="absolute right-0 bottom-0 p-4 text-[9px] text-zinc-200 uppercase font-black tracking-widest pointer-events-none print:hidden">Page 1 / A4</div>
            </div>

            {/* Note: In a real Word-like editor, we would calculate height and overflow content to a 2nd page div. 
                For MVP, we allow the container to grow, and window.print() handles the page breaks automatically. */}
        </div>
      </div>
    </div>
   );
}

function ToolbarButton({ onClick, icon, title }: { onClick: () => void, icon: React.ReactNode, title: string }) {
    return (
        <button 
            onClick={onClick}
            title={title}
            className="p-1.5 hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] rounded transition-colors"
        >
            {icon}
        </button>
    );
}

function VariableTag({ tag, label, onClick }: { tag: string, label: string, onClick: (text: string) => void }) {
    const copyToClipboard = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(tag);
        toast.info(`Skopiowano: ${tag}`);
    };

    return (
        <div
            onClick={() => onClick(tag)}
            role="button"
            tabIndex={0}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-[#0c0c0f] border border-[#27272a] hover:border-[#a78bfa]/50 transition-all group text-left cursor-pointer"
            title="Kliknij aby wstawić"
        >
            <span className="text-[10px] font-mono text-[#a78bfa]">{tag}</span>
            <div className="flex items-center gap-2">
                <span className="text-[9px] text-[#52525b] group-hover:text-[#a1a1aa] font-bold uppercase tracking-tighter">{label}</span>
                <button 
                    onClick={copyToClipboard}
                    className="p-1 hover:bg-[#1a1a1c] rounded transition-colors"
                >
                    <Copy className="w-2.5 h-2.5 text-[#27272a] group-hover:text-[#a78bfa]" />
                </button>
            </div>
        </div>
    );
}
