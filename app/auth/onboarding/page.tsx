"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase, ArrowRight, Loader2 } from "lucide-react";
import { createWorkspaceAction } from "@/lib/actions/workspaces";

export default function OnboardingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await createWorkspaceAction(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        router.push("/dashboard");
        router.refresh();
      }
    });
  };

  return (
    <div className="w-full bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-8 shadow-2xl backdrop-blur-md">
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-[#a78bfa]/10 border border-[#a78bfa]/20 mb-6 flex items-center justify-center">
          <Briefcase className="w-8 h-8 text-[#a78bfa]" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Stwórz swoją przestrzeń
        </h1>
        <p className="text-[#a1a1aa] text-sm max-w-sm mx-auto">
          Zanim zaczniesz, musisz dołączyć do istniejącej przestrzeni roboczej (poproś o zaproszenie) albo stworzyć nową.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-2">
            Nazwa nowej organizacji / workspace
          </label>
          <input
            name="name"
            disabled={isPending}
            type="text"
            required
            className="w-full bg-[#18181b] border border-[#27272a] text-[#fafafa] rounded-lg px-4 py-3 focus:outline-none focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] transition-colors placeholder:text-zinc-600"
            placeholder="Np. Acme Corp, Agencja Ninja"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#a78bfa] text-[#09090b] font-bold rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-[#c4b5fd] transition-colors shadow-[0_0_15px_rgba(167,139,250,0.3)] disabled:opacity-50 disabled:shadow-none"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Utwórz i przejdź do panelu
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center pt-6 border-t border-[#27272a]">
         <Link
          href="/auth/login"
          className="text-xs font-medium text-[#52525b] hover:text-[#a78bfa] transition-colors"
        >
          Zaloguj się na inne konto (lub wyloguj)
        </Link>
      </div>
    </div>
  );
}
