"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LayoutDashboard } from "lucide-react";

// Human-readable labels for URL segments
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  leads: "Leady",
  clients: "Klienci",
  projects: "Projekty",
  tasks: "Taski",
  kanban: "Kanban",
  documents: "Dokumenty",
  revenue: "Revenue",
  costs: "Koszty",
  admin: "Admin",
  new: "Nowy",
  edit: "Edytuj",
  settings: "Ustawienia",
  profile: "Profil",
};

function formatSegment(segment: string): string {
  // If it's a known label, use it
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];
  // If it looks like a UUID/ID, shorten it
  if (/^[0-9a-f-]{8,}$/i.test(segment)) return `#${segment.slice(0, 6)}…`;
  // Otherwise capitalize first letter
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-1 text-xs overflow-hidden" aria-label="Breadcrumb">
      <Link
        href="/dashboard"
        className="p-1.5 rounded-lg text-[#52525b] hover:text-[#a78bfa] hover:bg-[#141416] transition-colors"
        aria-label="Dashboard"
      >
        <LayoutDashboard className="w-3.5 h-3.5" />
      </Link>

      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const label = formatSegment(segment);

        return (
          <div key={href} className="flex items-center gap-1 shrink-0">
            <ChevronRight className="w-3 h-3 text-[#3f3f46]" />
            {isLast ? (
              <span className="font-medium text-[#fafafa] max-w-[160px] truncate">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="text-[#52525b] hover:text-[#a1a1aa] transition-colors max-w-[120px] truncate"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
