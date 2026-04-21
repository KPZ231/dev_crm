"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/actions/clients";
import { ClientForm } from "@/app/components/clients/ClientForm";
import { ClientFormValues } from "@/lib/schemas/client";
import { toast } from "sonner";

interface ClientNewClientProps {
  workspaceId: string;
}

export function ClientNewClient({ workspaceId }: ClientNewClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(data: ClientFormValues) {
    try {
      setIsLoading(true);
      const client = await createClient(workspaceId, data);
      toast.success("Klient został utworzony");
      router.push(`/dashboard/clients/${client.id}`);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Wystąpił błąd podczas tworzenia klienta.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ClientForm 
      onSubmit={onSubmit} 
      onCancel={() => router.push("/dashboard/clients")} 
      isLoading={isLoading} 
    />
  );
}
