"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateClient } from "@/lib/actions/clients";
import { ClientForm } from "@/app/components/clients/ClientForm";
import { ClientFormValues } from "@/lib/schemas/client";
import { ClientWithDetails } from "@/lib/types/client";
import { toast } from "sonner";

interface ClientEditClientProps {
  client: ClientWithDetails;
  workspaceId: string;
}

export function ClientEditClient({ client, workspaceId }: ClientEditClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(data: ClientFormValues) {
    try {
      setIsLoading(true);
      await updateClient(workspaceId, client.id, data);
      toast.success("Dane klienta zostały zaktualizowane");
      router.push(`/dashboard/clients/${client.id}`);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Wystąpił błąd podczas aktualizacji klienta.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ClientForm 
      initialData={client as any} 
      onSubmit={onSubmit} 
      onCancel={() => router.push(`/dashboard/clients/${client.id}`)} 
      isLoading={isLoading} 
    />
  );
}
