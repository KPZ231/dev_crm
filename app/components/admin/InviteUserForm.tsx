"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inviteSchema, InviteFormValues } from "@/lib/schemas/admin";
import { useState } from "react";
import { inviteUser } from "@/lib/actions/admin";
import { Mail, Shield, Loader2, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

interface InviteUserFormProps {
  workspaceId: string;
}

export function InviteUserForm({ workspaceId }: InviteUserFormProps) {
  const [loading, setLoading] = useState(false);
  const [invitedToken, setInvitedToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: "DEVELOPER",
    },
  });

  const onSubmit = async (data: InviteFormValues) => {
    try {
      setLoading(true);
      const result = await inviteUser(workspaceId, data);
      setInvitedToken(result.token);
      reset();
      toast.success("Zaproszenie wysłane!");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Wystąpił błąd";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!invitedToken) return;
    const url = `${window.location.origin}/invite/${invitedToken}`;
    navigator.clipboard.writeText(url);
    toast.success("Link skopiowany!");
  };

  return (
    <div className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#a78bfa]/10 flex items-center justify-center">
          <Mail className="w-5 h-5 text-[#a78bfa]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#fafafa]">Zaproś użytkownika</h3>
          <p className="text-xs text-[#52525b]">Dodaj nowego członka do swojego zespołu</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#fafafa] uppercase tracking-wider">E-mail</label>
          <input
            {...register("email")}
            placeholder="example@company.com"
            className="w-full bg-[#141416] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none transition-all"
          />
          {errors.email && <p className="text-red-400 text-[10px] mt-1 font-medium">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#fafafa] uppercase tracking-wider">Rola</label>
          <div className="relative">
            <select
              {...register("role")}
              className="w-full bg-[#141416] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none transition-all appearance-none"
            >
              <option value="DEVELOPER">Developer</option>
              <option value="PM">Project Manager</option>
              <option value="SALES">Sales</option>
              <option value="ADMIN">Admin</option>
              <option value="OWNER">Owner</option>
            </select>
            <Shield className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b] pointer-events-none" />
          </div>
          {errors.role && <p className="text-red-400 text-[10px] mt-1 font-medium">{errors.role.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#09090b] font-bold py-3 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>Zaproś członka</>
          )}
        </button>
      </form>

      {invitedToken && (
        <div className="mt-6 p-4 bg-[#a78bfa]/5 border border-[#a78bfa]/20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 text-[#a78bfa] mb-2 font-bold text-xs uppercase tracking-widest">
            <CheckCircle2 className="w-4 h-4" />
            Zaproszenie utworzone
          </div>
          <p className="text-[11px] text-[#a1a1aa] mb-3">
            Skopiuj poniższy link i wyślij go ręcznie do użytkownika:
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={`${window.location.origin}/invite/${invitedToken}`}
              className="flex-grow bg-[#141416] border border-[#27272a] rounded-lg px-3 py-2 text-[10px] text-[#52525b] outline-none"
            />
            <button
              onClick={copyLink}
              className="p-2 bg-[#a78bfa] rounded-lg text-[#09090b]"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
