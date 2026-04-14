"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, X, Info } from "lucide-react";

export function DevWarning() {
  const [showPopup, setShowPopup] = useState(false);
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("dev_warning_dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      // Use a timeout to avoid synchronous setState inside an effect warning
      const timer = setTimeout(() => {
        setShowBar(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClosePopup = () => {
    setShowPopup(false);
    setShowBar(true);
    localStorage.setItem("dev_warning_dismissed", "true");
  };

  return (
    <>
      <AnimatePresence>
        {showBar && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="fixed top-0 left-0 right-0 bg-yellow-400 text-black flex items-center justify-center px-4 py-1.5 gap-2 z-[60] shadow-lg border-b border-black/10"
          >
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] text-center">
              Aplikacja w wersji Preview — niektóre moduły mogą być nieaktywne
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#09090b]/90 backdrop-blur-md"
              onClick={handleClosePopup}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-[#0c0c0f] border border-[#27272a] rounded-[2.5rem] p-10 lg:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 flex">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-full ${i % 2 === 0 ? "bg-yellow-400" : "bg-black"}`}
                    style={{ transform: "skewX(-20deg)" }}
                  />
                ))}
              </div>

              <div className="space-y-8 text-center">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-yellow-400/20 blur-2xl rounded-full" />
                  <div className="relative w-24 h-24 bg-[#141416] border border-yellow-400/30 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                    <AlertTriangle className="w-12 h-12 text-yellow-400" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl lg:text-4xl font-black text-[#fafafa] tracking-tight">System w budowie</h2>
                  <p className="text-[#a1a1aa] text-base lg:text-lg leading-relaxed font-medium">
                    DevCRM przechodzi obecnie intensywne prace rozwojowe. Dostęp do niektórych funkcji może być
                    ograniczony, a dane mogą być usuwane podczas aktualizacji.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#141416] border border-[#27272a] rounded-2xl p-5 flex flex-col items-center gap-3 text-center">
                    <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center text-yellow-500">
                      <Info className="w-5 h-5" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#52525b]">Modele Finansowe</p>
                    <p className="text-xs text-[#a1a1aa]">Algorytmy revenue są w trakcie kalibracji</p>
                  </div>
                  <div className="bg-[#141416] border border-[#27272a] rounded-2xl p-5 flex flex-col items-center gap-3 text-center">
                    <div className="w-10 h-10 bg-[#a78bfa]/10 rounded-xl flex items-center justify-center text-[#a78bfa]">
                      <Info className="w-5 h-5" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#52525b]">Dokumentacja</p>
                    <p className="text-xs text-[#a1a1aa]">Generatory PDF mogą zawierać błędy</p>
                  </div>
                </div>

                <button
                  onClick={handleClosePopup}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-5 rounded-[1.5rem] text-sm uppercase tracking-widest shadow-xl shadow-yellow-400/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Akceptuję ryzyko i kontynuuję
                </button>
              </div>

              <button
                onClick={handleClosePopup}
                className="absolute top-6 right-6 p-2.5 hover:bg-[#141416] rounded-2xl transition-colors group"
              >
                <X className="w-6 h-6 text-[#52525b] group-hover:text-white transition-colors" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
