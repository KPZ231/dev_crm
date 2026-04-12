"use client";

import { useState, useEffect } from "react";
import { SearchModal } from "./SearchModal";
import { AnimatePresence, motion } from "motion/react";
import { Search } from "lucide-react";

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Trigger element (optional UI representation) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#0c0c0f] border border-[#27272a] rounded-lg text-[#52525b] hover:border-[#a78bfa]/30 transition-all cursor-text w-full group"
      >
        <Search className="w-3.5 h-3.5 group-hover:text-[#a78bfa] transition-colors" />
        <span className="text-[10px] font-black uppercase tracking-widest">Global Search CLI</span>
        <div className="ml-auto flex items-center gap-0.5 text-[8px] border border-[#27272a] px-1 rounded bg-[#0c0c0f] font-black uppercase tracking-widest">
            ⌘K
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[199]"
            />
            {/* Modal */}
            <SearchModal onClose={() => setIsOpen(false)} />
          </>
        )}
      </AnimatePresence>
    </>
  );
}
