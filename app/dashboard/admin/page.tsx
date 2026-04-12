import { Settings, ShieldAlert, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-[#141416] border border-[#27272a] rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
        <ShieldAlert className="w-12 h-12 text-[#a78bfa]" />
      </div>
      <h1 className="text-3xl font-bold text-[#fafafa] tracking-tight mb-4">Panel Administracyjny</h1>
      <p className="text-[#a1a1aa] max-w-md mx-auto leading-relaxed mb-8">
        Zarządzanie uprawnieniami, użytkownikami i ustawieniami workspace zostanie dodane w nadchodzącej aktualizacji systemu.
      </p>
      <Link 
        href="/dashboard"
        className="flex items-center gap-2 bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#09090b] font-bold px-6 py-3 rounded-xl transition-all shadow-lg"
      >
        <LayoutDashboard className="w-4 h-4" />
        Wróć do Panelu
      </Link>
    </div>
  );
}
