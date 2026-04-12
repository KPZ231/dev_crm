"use client";

import { useState, useRef, useEffect } from "react";
import { User as UserIcon, Settings, LogOut, ChevronDown, Shield } from "lucide-react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
    image?: string | null;
  };
}

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  PM: "Project Manager",
  DEVELOPER: "Developer",
  SALES: "Sales",
};

const ROLE_COLORS: Record<string, string> = {
  OWNER: "text-[#a78bfa] bg-[#a78bfa]/10 border-[#a78bfa]/20",
  ADMIN: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  PM: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  DEVELOPER: "text-[#34d399] bg-[#34d399]/10 border-[#34d399]/20",
  SALES: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
};

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const roleLabel = ROLE_LABELS[user.role ?? ""] ?? user.role ?? "User";
  const roleColor = ROLE_COLORS[user.role ?? ""] ?? "text-zinc-400 bg-zinc-400/10 border-zinc-400/20";

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 p-1 pr-2.5 rounded-xl border transition-all",
          isOpen
            ? "bg-[#141416] border-[#3f3f46]"
            : "border-transparent hover:bg-[#141416] hover:border-[#27272a]"
        )}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-[#27272a]">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "Avatar"}
              width={32}
              height={32}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#a78bfa]/10 text-[#a78bfa] text-[11px] font-bold">
              {initials}
            </div>
          )}
        </div>

        {/* Name + role - hidden on small screens */}
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-[#fafafa] leading-tight max-w-[110px] truncate">
            {user.name ?? "Użytkownik"}
          </p>
          <p className="text-[9px] text-[#52525b] font-bold uppercase tracking-wider">
            {roleLabel}
          </p>
        </div>

        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-[#52525b] transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 bg-[#0c0c0f] border border-[#27272a] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50"
          >
            {/* Profile header */}
            <div className="p-4 border-b border-[#1a1a1d]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl overflow-hidden border border-[#27272a] shrink-0">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name ?? "Avatar"}
                      width={44}
                      height={44}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#a78bfa]/10 text-[#a78bfa] text-sm font-bold">
                      {initials}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#fafafa] truncate">
                    {user.name ?? "Użytkownik"}
                  </p>
                  <p className="text-[10px] text-[#52525b] truncate mt-0.5">
                    {user.email}
                  </p>
                  <span className={cn(
                    "inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border mt-1",
                    roleColor
                  )}>
                    <Shield className="w-2.5 h-2.5" />
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-2">
              <MenuItem href="/dashboard/profile" icon={<UserIcon className="w-4 h-4" />} label="Mój profil" />
              <MenuItem href="/dashboard/settings" icon={<Settings className="w-4 h-4" />} label="Ustawienia" />

              <div className="h-px bg-[#1a1a1d] my-2" />

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                Wyloguj się
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b] rounded-xl transition-all"
    >
      <span className="text-[#52525b]">{icon}</span>
      {label}
    </Link>
  );
}
