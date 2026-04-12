"use client";

import { useState } from "react";
import { Bell, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  // Mock notifications for demonstration
  const notifications = [
    { id: 1, type: "info", content: "Nowy lead dodany przez System", time: "2 min temu" },
    { id: 2, type: "warning", content: "Nieopłacona faktura: Client XYZ", time: "1h temu" },
    { id: 3, type: "success", content: "Zadanie ukończone: UI Design", time: "3h temu" },
  ];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl hover:bg-[#141416] transition-colors relative border border-transparent hover:border-[#27272a] text-[#52525b] hover:text-[#a78bfa] group"
      >
        <Bell className="w-5 h-5 transition-transform group-hover:rotate-12" />
        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#a78bfa] rounded-full border-2 border-[#09090b] shadow-lg shadow-[#a78bfa]/20" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
               initial={{ opacity: 0, y: 10, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 10, scale: 0.95 }}
               className="absolute right-0 mt-2 w-80 bg-[#0c0c0f] border border-[#27272a] rounded-2xl shadow-2xl p-4 z-50 overflow-hidden"
            >
                <div className="flex items-center justify-between mb-4 px-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#fafafa]">Powiadomienia</h4>
                    <button className="text-[10px] text-[#a78bfa] font-bold hover:underline">Oznacz jako przeczytane</button>
                </div>

                <div className="space-y-2">
                    {notifications.map(n => (
                        <div key={n.id} className="p-3 rounded-xl bg-[#141416]/50 border border-[#27272a] hover:border-[#a78bfa]/20 transition-all cursor-pointer group">
                            <div className="flex items-start gap-4">
                                <NotificationIcon type={n.type} />
                                <div className="overflow-hidden">
                                     <p className="text-xs text-[#a1a1aa] group-hover:text-[#fafafa] transition-colors leading-relaxed">{n.content}</p>
                                     <span className="text-[8px] text-[#52525b] uppercase font-bold tracking-widest mt-1 block">{n.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="w-full mt-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#52525b] hover:text-[#a78bfa] bg-[#141416] rounded-xl transition-all">
                    Zobacz wszystkie
                </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationIcon({ type }: { type: string }) {
    switch(type) {
        case "info": return <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20"><Info className="w-3 h-3" /></div>;
        case "warning": return <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20"><AlertTriangle className="w-3 h-3" /></div>;
        case "success": return <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /></div>;
        default: return <div className="p-1.5 rounded-lg bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"><Info className="w-3 h-3" /></div>;
    }
}
