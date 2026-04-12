"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { gsap } from "gsap";
import { Menu, X, ArrowRight, LogOut, LayoutDashboard } from "lucide-react";
import Image from "next/image";

const navLinks = [
  { name: "Funkcje", href: "#features" },
  { name: "Cennik", href: "#pricing" },
  { name: "O projekcie", href: "/about-project" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <nav
      ref={navRef}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl"
    >
      <div className="relative group">
        {/* Ambient glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#a78bfa]/20 via-[#34d399]/10 to-[#a78bfa]/20 rounded-2xl blur-xl opacity-40 group-hover:opacity-70 transition duration-700 pointer-events-none" />

        <div className="relative flex items-center justify-between px-5 py-3 bg-[#0c0c0f]/70 backdrop-blur-xl border border-[#27272a]/60 rounded-2xl shadow-2xl">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group/logo shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#a78bfa] flex items-center justify-center text-[#09090b] font-black text-sm group-hover/logo:scale-105 transition-transform shadow-lg shadow-[#a78bfa]/20">
              C
            </div>
            <span className="text-white font-bold tracking-tight text-lg hidden sm:block">
              Dev<span className="text-[#a78bfa]">CRM</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200
                    ${isActive
                      ? "text-[#a78bfa] bg-[#a78bfa]/10"
                      : "text-[#a1a1aa] hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right side CTA */}
          <div className="flex items-center gap-3 shrink-0">
            {status === "loading" ? (
              // Skeleton while loading session
              <div className="w-8 h-8 rounded-full bg-[#18181b] animate-pulse" />
            ) : user ? (
              // Logged in — show avatar + go to dashboard
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#a1a1aa] hover:text-[#fafafa] hover:bg-white/5 rounded-xl transition-all"
                >
                  <LayoutDashboard size={14} />
                  Panel
                </Link>
                <div className="h-5 w-px bg-[#27272a] hidden sm:block" />
                {/* User avatar dropdown trigger */}
                <div className="relative group/avatar">
                  <button className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-all group-focus-within/avatar:bg-white/5">
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#27272a]">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name ?? "Avatar"}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#a78bfa]/10 text-[#a78bfa] flex items-center justify-center text-[11px] font-bold">
                          {initials}
                        </div>
                      )}
                    </div>
                    <span className="hidden sm:block text-xs font-medium text-[#a1a1aa] max-w-[80px] truncate">
                      {user.name?.split(" ")[0]}
                    </span>
                  </button>

                  {/* Mini dropdown on hover */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#0c0c0f] border border-[#27272a] rounded-xl shadow-2xl p-2 opacity-0 invisible group-hover/avatar:opacity-100 group-hover/avatar:visible transition-all duration-150 origin-top-right scale-95 group-hover/avatar:scale-100 z-50">
                    <div className="px-3 py-2 mb-1 border-b border-[#1a1a1d]">
                      <p className="text-xs font-semibold text-[#fafafa] truncate">{user.name}</p>
                      <p className="text-[10px] text-[#52525b] truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-xs text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b] rounded-lg transition-all"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" /> Panel
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Wyloguj się
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Not logged in — Login + CTA
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="hidden sm:block px-4 py-2 text-sm font-medium text-[#a1a1aa] hover:text-white rounded-xl hover:bg-white/5 transition-all"
                >
                  Zaloguj się
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#a78bfa] text-[#09090b] text-sm font-bold rounded-xl hover:bg-[#c4b5fd] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#a78bfa]/20"
                >
                  Zacznij teraz
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-[#a1a1aa] hover:text-white rounded-xl hover:bg-white/5 transition-all"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {isOpen && (
          <div className="absolute top-full mt-2 left-0 w-full p-3 bg-[#0c0c0f]/95 backdrop-blur-2xl border border-[#27272a]/60 rounded-2xl md:hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${pathname === item.href
                      ? "bg-[#a78bfa]/10 text-[#a78bfa]"
                      : "text-[#a1a1aa] hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  {item.name}
                </Link>
              ))}

              <div className="h-px bg-[#27272a] my-2" />

              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-[#a1a1aa] hover:text-[#fafafa] hover:bg-white/5 rounded-xl transition-all"
                  >
                    <LayoutDashboard size={16} /> Przejdź do panelu
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <LogOut size={16} /> Wyloguj się
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 text-sm text-[#a1a1aa] hover:text-[#fafafa] hover:bg-white/5 rounded-xl transition-all"
                  >
                    Zaloguj się
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsOpen(false)}
                    className="mt-1 py-3 bg-[#a78bfa] text-[#09090b] font-bold rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-[#c4b5fd] transition-all"
                  >
                    Zacznij teraz <ArrowRight size={16} />
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
