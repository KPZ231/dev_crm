"use client";

import { useState } from "react";
import { DocumentPreview } from "./DocumentPreview";
import { Save, Eye, Edit3, Type } from "lucide-react";

interface DocumentEditorProps {
  initialContent: string;
  onSave: (content: string) => Promise<void>;
  isLoading?: boolean;
}

export function DocumentEditor({ initialContent, onSave, isLoading }: DocumentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [activeView, setActiveView] = useState<"edit" | "preview" | "split">("split");

  return (
    <div className="flex flex-col h-full bg-[#09090b] border border-[#27272a] rounded-2xl overflow-hidden shadow-2xl">
      {/* Toolbar */}
      <div className="bg-[#0c0c0f] border-b border-[#27272a] p-3 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-[#141416] p-1 rounded-lg border border-[#27272a]">
            <ViewToggle active={activeView === 'edit'} onClick={() => setActiveView('edit')} icon={<Edit3 className="w-4 h-4" />} label="Edytor" />
            <ViewToggle active={activeView === 'split'} onClick={() => setActiveView('split')} icon={<Type className="w-4 h-4" />} label="Split" />
            <ViewToggle active={activeView === 'preview'} onClick={() => setActiveView('preview')} icon={<Eye className="w-4 h-4" />} label="Podgląd" />
        </div>

        <div className="flex items-center gap-3">
            <button 
                onClick={() => onSave(content)}
                disabled={isLoading}
                className="flex items-center gap-2 bg-[#a78bfa] hover:bg-[#8b5cf6] disabled:opacity-50 text-[#09090b] font-bold px-5 py-2 rounded-lg text-xs transition-all"
            >
                <Save className="w-4 h-4" /> {isLoading ? "Zapisywanie..." : "Zapisz dokument"}
            </button>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex flex-grow overflow-hidden">
        {/* Editor Pane */}
        {(activeView === 'edit' || activeView === 'split') && (
            <div className={`flex-grow flex flex-col h-full border-r border-[#27272a]/50 ${activeView === 'split' ? 'w-1/2' : 'w-full'}`}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-grow p-8 bg-[#09090b] text-[#fafafa] font-mono text-sm resize-none outline-none custom-scrollbar"
                    placeholder="Wpisz treść dokumentu... (Możesz używać Markdown)"
                />
            </div>
        )}

        {/* Preview Pane */}
        {(activeView === 'preview' || activeView === 'split') && (
            <div className={`flex-grow bg-[#141416] h-full overflow-y-auto custom-scrollbar ${activeView === 'split' ? 'w-1/2' : 'w-full'}`}>
                <div className="p-12 min-h-full">
                    <DocumentPreview content={content} />
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

interface ViewToggleProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function ViewToggle({ active, onClick, icon, label }: ViewToggleProps) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                active ? 'bg-[#a78bfa] text-[#09090b]' : 'text-[#52525b] hover:text-[#a1a1aa]'
            }`}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}

