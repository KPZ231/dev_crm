"use client";

import { useState } from "react";
import { ClientWithStats } from "@/lib/types/client";
import { ClientFilters } from "@/app/components/clients/ClientFilters";
import { ClientTable } from "@/app/components/clients/ClientTable";
import { ClientCard } from "@/app/components/clients/ClientCard";

interface ClientsListPageClientProps {
  clients: ClientWithStats[];
  searchParams: {
    search?: string;
    status?: string;
    paymentStatus?: string;
  };
}

export function ClientsListPageClient({ clients, searchParams }: ClientsListPageClientProps) {
  const [view, setView] = useState<"table" | "card">("table");

  return (
    <div className="flex flex-col grow">
      <ClientFilters 
        initialSearch={searchParams.search} 
        initialStatus={searchParams.status}
        initialPaymentStatus={searchParams.paymentStatus}
        view={view}
        onViewChange={setView}
      />

      <div className="p-8 grow overflow-auto custom-scrollbar">
        {view === "table" ? (
          <ClientTable clients={clients} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {clients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
            {clients.length === 0 && (
                <div className="col-span-full py-20 text-center text-[#52525b]">
                    Brak klientów do wyświetlenia w tym widoku.
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
