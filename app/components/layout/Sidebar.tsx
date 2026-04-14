"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSidebarItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { WorkspaceRole } from "@prisma/client";

interface SidebarProps {
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

function Avatar({
  name,
  image,
  size = "md",
}: {
  name?: string | null;
  image?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const dims = { sm: "w-7 h-7 text-[10px]", md: "w-9 h-9 text-xs", lg: "w-11 h-11 text-sm" }[size];
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  if (image) {
    return (
      <div className={cn("rounded-xl overflow-hidden shrink-0 border border-[#27272a]", dims)}>
        <Image src={image} alt={name ?? "Avatar"} width={44} height={44} className="object-cover w-full h-full" />
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-xl shrink-0 flex items-center justify-center font-bold border",
      "bg-[#a78bfa]/10 border-[#a78bfa]/20 text-[#a78bfa]",
      dims
    )}>
      {initials}
    </div>
  );
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const roleLabel = ROLE_LABELS[user.role ?? ""] ?? user.role ?? "User";
  const roleColor = ROLE_COLORS[user.role ?? ""] ?? "text-zinc-400 bg-zinc-400/10 border-zinc-400/20";

  const items = getSidebarItems((user.role as WorkspaceRole) || "DEVELOPER");

  // Group items: main nav vs bottom (admin)
  const mainItems = items.filter((i) => i.href !== "/dashboard/admin");
  const adminItem = items.find((i) => i.href === "/dashboard/admin");

  return (
    <aside className="w-64 border-r border-[#27272a] bg-[#0c0c0f] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="h-16 px-5 border-b border-[#27272a] flex items-center shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#a78bfa] flex items-center justify-center text-[#09090b] font-black text-sm group-hover:scale-105 transition-transform shadow-lg shadow-[#a78bfa]/20">
            C
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Dev<span className="text-[#a78bfa]">CRM</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-[9px] font-black uppercase tracking-widest text-[#3f3f46] px-3 py-2 mt-1">
          Nawigacja
        </p>
        {mainItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 group relative",
                isActive
                  ? "bg-[#a78bfa]/10 text-[#a78bfa]"
                  : "text-[#71717a] hover:text-[#d4d4d8] hover:bg-[#18181b]"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#a78bfa] rounded-full" />
              )}
              <item.icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  isActive ? "text-[#a78bfa]" : "text-[#52525b] group-hover:text-[#a1a1aa]"
                )}
              />
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}

        {adminItem && (
          <>
            <div className="h-px bg-[#27272a] my-3 mx-1" />
            <p className="text-[9px] font-black uppercase tracking-widest text-[#3f3f46] px-3 py-2">
              System
            </p>
            <Link
              href={adminItem.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 group relative",
                pathname.startsWith(adminItem.href)
                  ? "bg-[#a78bfa]/10 text-[#a78bfa]"
                  : "text-[#71717a] hover:text-[#d4d4d8] hover:bg-[#18181b]"
              )}
            >
              {pathname.startsWith(adminItem.href) && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#a78bfa] rounded-full" />
              )}
              <adminItem.icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  pathname.startsWith(adminItem.href) ? "text-[#a78bfa]" : "text-[#52525b] group-hover:text-[#a1a1aa]"
                )}
              />
              <span>{adminItem.title}</span>
            </Link>
          </>
        )}
      </nav>

      {/* User profile footer */}
      <div className="p-3 border-t border-[#27272a] shrink-0">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#141416] border border-[#27272a] group hover:border-[#3f3f46] transition-colors">
          <Avatar name={user.name} image={user.image} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#fafafa] truncate leading-tight">
              {user.name ?? "Użytkownik"}
            </p>
            <span className={cn(
              "inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border mt-0.5",
              roleColor
            )}>
              {roleLabel}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            title="Wyloguj"
            className="p-1.5 rounded-lg text-[#52525b] hover:text-red-400 hover:bg-red-400/10 transition-all shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
