"use client";

import { useState, useTransition, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LoginSchema } from "@/modules/iam/schemas";
import { loginAction } from "@/modules/iam/actions/auth-actions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");
    
    startTransition(() => {
      loginAction(values, callbackUrl).then((data) => {
        if (data?.error) {
          form.reset();
          setError(data.error);
        }
      }).catch(() => {
        setError("Coś poszło nie tak.");
      });
    });
  };

  return (
    <div className="w-full bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-8 shadow-2xl backdrop-blur-md">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Witaj ponownie</h1>
        <p className="text-[#a1a1aa] text-sm">Zaloguj się, aby uzyskać dostęp do panelu</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
                Hasło
              </label>
              <Link href="/auth/reset" className="text-xs text-[#a78bfa] hover:underline">
                Zapomniałeś hasła?
              </Link>
            </div>
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
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Zaloguj się"}
          {!isPending && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-[#a1a1aa]">
        Nie masz jeszcze konta?{" "}
        <Link href="/auth/register" className="text-[#a78bfa] hover:underline font-semibold">
          Zarejestruj się
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
        <div className="w-full bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-8 flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#a78bfa]" />
        </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
