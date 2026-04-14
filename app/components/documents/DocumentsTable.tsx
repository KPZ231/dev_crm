"use client";

import { DocumentWithRelations } from "@/lib/types/document";
import { 
  FileText, 
  Eye, 
  Clock,
  CheckCircle2,
  Send,
  Archive
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface DocumentsTableProps {
  documents: DocumentWithRelations[];
}

export function DocumentsTable({ documents }: DocumentsTableProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-[#0c0c0f] border border-[#27272a] rounded-xl border-dashed">
        <FileText className="w-12 h-12 text-[#52525b] mb-4" />
        <p className="text-[#a1a1aa]">Brak dokumentów w tej kategorii.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0c0c0f] border border-[#27272a] rounded-xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#27272a] text-[#52525b] text-[10px] uppercase font-bold tracking-widest">
              <th className="px-6 py-4">Dokument / klient</th>
              <th className="px-6 py-4">Typ</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Ostatnia zmiana</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1c]">
            {documents.map((doc) => (
              <tr key={doc.id} className="group hover:bg-[#141416] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#141416] border border-[#27272a] flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#a78bfa]" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-[#fafafa] group-hover:text-[#a78bfa] transition-colors">{doc.name}</div>
                        <div className="text-[10px] text-[#52525b] flex items-center gap-2">
                             <span>{doc.client?.companyName || doc.lead?.companyName || "Brak powiązania"}</span>
                        </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-[#a1a1aa] font-medium">{doc.type}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={doc.status} />
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-[#52525b]">
                  {format(new Date(doc.updatedAt), "dd.MM.yyyy, HH:mm", { locale: pl })}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link 
                      href={`/dashboard/documents/${doc.id}`}
                      className="p-2 text-[#52525b] hover:text-[#a78bfa] bg-[#141416] border border-[#27272a] rounded-lg transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "DRAFT":
      return <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] text-[#a1a1aa] border border-[#27272a]"><Clock className="w-3 h-3" /> DRAFT</span>;
    case "SENT":
      return <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-500/10 text-[10px] text-sky-400 border border-sky-500/20"><Send className="w-3 h-3" /> WYSŁANO</span>;
    case "SIGNED":
      return <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px] text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> PODPISANO</span>;
    case "ARCHIVED":
      return <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neutral-800 text-[10px] text-neutral-500 border border-neutral-700"><Archive className="w-3 h-3" /> ARCHIWUM</span>;
    default:
      return null;
  }
}
