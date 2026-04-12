"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { NavItem } from "@/lib/navigation";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface UserData {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  image?: string | null;
}

interface AppShellProps {
  children: React.ReactNode;
  user: UserData;
}

export function AppShell({ children, user }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex bg-[#09090b] min-h-screen text-[#fafafa] selection:bg-[#a78bfa]/30">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar user={user} />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 lg:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] z-101 lg:hidden shadow-2xl"
            >
                <div className="relative h-full">
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="absolute right-4 top-4 p-2 text-[#52525b] hover:text-[#fafafa] z-102"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <Sidebar user={user} />
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="grow flex flex-col min-w-0">
        <Header user={user} onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="grow overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-[1600px] mx-auto min-h-full">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
}
