"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { acceptInvitation } from "@/lib/actions/admin";
import { Loader2, CheckCircle2, ShieldAlert, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAccept = useCallback(async () => {
    try {
      const result = await acceptInvitation(token);
      if (result.success) {
        setStatus("success");
        toast.success("Dołączono do workspace!");
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch (error: any) {
      console.error(error);
      setStatus("error");
      setErrorMsg(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd.");
    }
  }, [token, router]);

  useEffect(() => {
    if (token) {
      handleAccept();
    }
  }, [token, handleAccept]);

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
        <div className="bg-[#0c0c0f] border border-[#27272a] rounded-3xl p-10 shadow-2xl text-center space-y-8">
          
          {status === "loading" && (
            <>
              <div className="w-20 h-20 bg-[#141416] border border-[#27272a] rounded-2xl flex items-center justify-center mx-auto">
                <Loader2 className="w-10 h-10 text-[#a78bfa] animate-spin" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#fafafa] mb-2">Przetwarzanie zaproszenia...</h1>
                <p className="text-sm text-[#52525b]">Weryfikujemy Twoje uprawnienia i dołączamy Cię do zespołu.</p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-20 h-20 bg-[#34d399]/10 border border-[#34d399]/20 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-[#34d399]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#fafafa] mb-2">Witamy w zespole!</h1>
                <p className="text-sm text-[#52525b]">Zaproszenie zostało pomyślnie zaakceptowane. Za chwilę zostaniesz przekierowany do panelu.</p>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
                <ShieldAlert className="w-10 h-10 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#fafafa] mb-2">Ups! Coś poszło nie tak</h1>
                <p className="text-sm text-[#52525b]">{errorMsg}</p>
              </div>
              <div className="pt-4">
                <Link 
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#09090b] font-bold px-6 py-3 rounded-xl transition-all shadow-lg"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Przejdź do Dashboardu
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
