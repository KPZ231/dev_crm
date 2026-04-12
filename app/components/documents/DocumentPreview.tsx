"use client";

import { motion } from "motion/react";

interface DocumentPreviewProps {
  content: string;
}

export function DocumentPreview({ content }: DocumentPreviewProps) {
  // Simple "formatting" logic for the preview
  const parseContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Very basic Markdown-like parsing for preview purposes
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-3xl font-black text-[#0c0c0f] mb-6 mt-8 border-b-2 border-[#a78bfa] pb-2">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-bold text-[#0c0c0f] mb-4 mt-6">{line.substring(3)}</h2>;
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-6 list-disc text-sm text-[#27272a] mb-1">{line.substring(2)}</li>;
      }
      if (line.trim() === '') {
        return <div key={i} className="h-4" />;
      }
      return <p key={i} className="text-sm text-[#27272a] leading-relaxed mb-3">{line}</p>;
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-4xl mx-auto min-h-[1000px] p-16 lg:p-24 relative overflow-hidden text-[#0c0c0f]"
    >
      {/* Stationery Elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#a78bfa] via-[#34d399] to-[#a78bfa]" />
      
      <div className="flex justify-between items-start mb-20">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0c0c0f] flex items-center justify-center text-white font-bold text-xl">D</div>
            <div className="font-black text-xl tracking-tighter uppercase italic text-[#0c0c0f]">Dev<span className="text-[#a78bfa]">CRM</span></div>
        </div>
        <div className="text-right text-[10px] text-[#a1a1aa] uppercase font-bold tracking-widest">
            Systemowy Wydruk Dokumentu
        </div>
      </div>

      <div className="prose prose-sm max-w-none">
        {parseContent(content)}
      </div>

      <div className="mt-40 pt-10 border-t border-[#f4f4f5] flex justify-between items-end">
        <div className="space-y-4">
            <div className="h-0.5 w-40 bg-[#e4e4e7]" />
            <p className="text-[10px] text-[#52525b] uppercase font-bold">Podpis wystawiającego</p>
        </div>
        <div className="space-y-4 text-right">
            <div className="h-0.5 w-40 bg-[#e4e4e7]" />
            <p className="text-[10px] text-[#52525b] uppercase font-bold">Podpis akceptującego</p>
        </div>
      </div>
      
      {/* Minimal watermark */}
      <div className="absolute bottom-10 left-0 right-0 text-center opacity-[0.03] rotate-[-15deg] pointer-events-none select-none">
        <span className="text-8xl font-black">ORIGINAL DEVCRM DOCUMENT</span>
      </div>
    </motion.div>
  );
}
