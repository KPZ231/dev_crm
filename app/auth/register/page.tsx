"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RegisterSchema } from "@/modules/iam/schemas";
import { registerAction } from "@/modules/iam/actions/auth-actions";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError("");
    setSuccess("");
    
    startTransition(() => {
      registerAction(values).then((data) => {
        setError(data.error);
        setSuccess(data.success);
      });
    });
  };

  return (
    <div className="w-full bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-8 shadow-2xl backdrop-blur-md">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Utwórz konto</h1>
        <p className="text-[#a1a1aa] text-sm">Zacznij zarządzać zespołem jak profesjonalista</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-2">
              Imię i nazwisko
            </label>
            <input
              {...form.register("name")}
              disabled={isPending}
              className="w-full bg-[#18181b] border border-[#27272a] text-[#fafafa] rounded-lg px-4 py-3 focus:outline-none focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] transition-colors"
              placeholder="Jan Kowalski"
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-2">
              Adres Email
            </label>
            <input
              {...form.register("email")}
              disabled={isPending}
              type="email"
              className="w-full bg-[#18181b] border border-[#27272a] text-[#fafafa] rounded-lg px-4 py-3 focus:outline-none focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] transition-colors"
              placeholder="twój@email.com"
            />
            {form.formState.errors.email && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-2">
              Hasło
            </label>
            <input
              {...form.register("password")}
              disabled={isPending}
              type="password"
              className="w-full bg-[#18181b] border border-[#27272a] text-[#fafafa] rounded-lg px-4 py-3 focus:outline-none focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] transition-colors"
              placeholder="********"
            />
            {form.formState.errors.password && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 text-sm px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#a78bfa] text-[#09090b] font-bold rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-[#c4b5fd] transition-colors shadow-[0_0_15px_rgba(167,139,250,0.3)] disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Zarejestruj się"}
          {!isPending && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-[#a1a1aa]">
        Masz już konto?{" "}
        <Link href="/auth/login" className="text-[#a78bfa] hover:underline font-semibold">
          Zaloguj się
        </Link>
      </div>
    </div>
  );
}
