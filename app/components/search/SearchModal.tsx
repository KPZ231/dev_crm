"use client";

import { useState, useEffect, useRef } from "react";
import { 
    Search, 
    X, 
    Loader2, 
    Globe, 
    Phone, 
    MapPin, 
    ExternalLink,
    Command,
    History,
    Zap,
    AlertCircle
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback } from "react";
import { SearchResult, SearchJobResponse } from "@/lib/types/search";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  onClose: () => void;
}

export function SearchModal({ onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<SearchJobResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  const startSearch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setJobId(null);
      setStatus(null);

      const response = await fetch("/api/search", {
        method: "POST",
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setJobId(data.jobId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd");
      setIsLoading(false);
    }
  }, [query]);

  const checkStatus = useCallback(async () => {
    if (!jobId) return;
    try {
      const response = await fetch(`/api/search?jobId=${jobId}`);
      if (!response.ok) throw new Error("Status check failed");
      const data = await response.json();
      setStatus(data);
    } catch (err) {
        console.error(err);
    }
  }, [jobId]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 3) {
        startSearch();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [query, startSearch]);

  // Polling logic
  useEffect(() => {
    if (jobId && !pollInterval.current) {
        pollInterval.current = setInterval(() => {
            checkStatus();
        }, 3000);
    }

    if (status?.status === 'completed' || status?.status === 'failed') {
        if (pollInterval.current) clearInterval(pollInterval.current);
        pollInterval.current = null;
        setIsLoading(false);
    }

    return () => {
        if (pollInterval.current) clearInterval(pollInterval.current);
        pollInterval.current = null;
    };
  }, [jobId, status, checkStatus]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      className="fixed left-1/2 top-[15%] -translate-x-1/2 w-full max-w-2xl bg-[#0c0c0f] border border-[#27272a] rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] z-[200] overflow-hidden"
    >
      {/* Search Header */}
      <div className="relative border-b border-[#27272a] p-6 flex items-center gap-4">
        <Search className={cn("w-6 h-6 transition-colors", isLoading ? "text-[#a78bfa] animate-pulse" : "text-[#52525b]")} />
        <input 
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj firm i leadów globalnie (np. 'dentist New York')"
          className="flex-grow bg-transparent text-xl font-bold text-[#fafafa] outline-none placeholder:text-[#27272a]"
        />
        <button onClick={onClose} className="p-2 hover:bg-[#141416] rounded-xl text-[#52525b] transition-colors">
            <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Area */}
      <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-2">
        {/* Progress Bar */}
        {isLoading && status && (
            <div className="px-6 py-4 border-b border-[#27272a]/50">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase text-[#a78bfa] flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" /> Skanowanie sieci...
                    </span>
                    <span className="text-[10px] font-bold text-[#52525b]">{status.progress || 0}%</span>
                </div>
                <div className="w-full h-1 bg-[#141416] rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${status.progress || 0}%` }}
                        className="h-full bg-[#a78bfa] shadow-[0_0_15px_rgba(167,139,250,0.5)]"
                    />
                </div>
            </div>
        )}

        {/* Results List */}
        <div className="space-y-1 p-2">
            {status?.results.map((result, idx) => (
                <ResultItem key={result.id} result={result} index={idx} />
            ))}

            {!isLoading && !status && !error && query.length === 0 && (
                <div className="py-20 text-center space-y-4">
                    <div className="flex justify-center gap-4 opacity-20">
                        <History className="w-10 h-10" />
                        <Zap className="w-10 h-10" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#52525b]">Zacznij pisać, aby przeskandować globalne bazy firm</p>
                        <p className="text-[10px] uppercase font-black tracking-widest text-[#27272a] mt-2 italic">Real-time Lead Scraper integration</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="p-10 text-center text-red-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-bold">{error}</p>
                </div>
            )}
        </div>
      </div>

      {/* Footer / Shortcuts */}
      <div className="bg-[#09090b] p-4 border-t border-[#27272a] flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#52525b]">
          <div className="flex gap-4">
              <span className="flex items-center gap-1"><Command className="w-3 h-3" /> <span className="text-[#a78bfa]">K</span> aby zamknąć</span>
              <span className="flex items-center gap-1">↑↓ Wybierz</span>
              <span className="flex items-center gap-1">↵ Otwórz</span>
          </div>
          <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Scraper API Connected
          </div>
      </div>
    </motion.div>
  );
}

function ResultItem({ result, index }: { result: SearchResult; index: number }) {
    return (
        <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-4 p-4 rounded-2xl hover:bg-[#141416] border border-transparent hover:border-[#27272a] transition-all group cursor-pointer"
        >
            <div className="shrink-0 w-10 h-10 rounded-xl bg-[#141416] border border-[#27272a] flex items-center justify-center text-[#a78bfa] group-hover:bg-[#a78bfa] group-hover:text-[#09090b] transition-all">
                <Globe className="w-5 h-5" />
            </div>
            
            <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-[#fafafa] truncate group-hover:text-[#a78bfa] transition-colors">{result.name}</h4>
                    <span className="text-[9px] font-black tracking-tighter uppercase px-2 py-0.5 rounded-full bg-[#18181b] border border-[#27272a] text-[#52525b]">
                        {result.category}
                    </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4">
                    {result.address && (
                        <div className="flex items-center gap-1.5 text-[10px] text-[#52525b]">
                            <MapPin className="w-3 h-3" /> {result.address}
                        </div>
                    )}
                    {result.phone && (
                        <div className="flex items-center gap-1.5 text-[10px] text-[#52525b]">
                            <Phone className="w-3 h-3" /> {result.phone}
                        </div>
                    )}
                </div>
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-4 h-4 text-[#a78bfa]" />
            </div>
        </motion.div>
    );
}

