"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { clientSchema, clientUpdateSchema } from "@/lib/schemas/client";
import { ClientFilters, ClientWithDetails, ClientWithStats } from "@/lib/types/client";
import { requireWorkspacePermission } from "@/core/access/workspace";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getClients(workspaceId: string, filters?: ClientFilters): Promise<ClientWithStats[]> {
  await requireWorkspacePermission(workspaceId, "read", "client");

  const { search, status, paymentStatus, sortBy = "createdAt", sortOrder = "desc" } = filters || {};

  const clients = await prisma.client.findMany({
    where: {
      workspaceId,
      ...(search && {
        OR: [
          { companyName: { contains: search, mode: "insensitive" } },
          { contactPerson: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
    },
    include: {
      _count: {
        select: {
          projects: true,
          invoices: true,
          documents: true,
        },
      },
      invoices: {
        select: {
          amount: true,
          status: true,
        }
      },
      projects: {
          where: {
              status: { notIn: ["COMPLETED", "CANCELLED"] }
          }
      }
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  // Calculate some derived stats for the list
  return clients.map(client => ({
    ...client,
    projects: client.projects.map(p => ({
      ...p,
      budget: p.budget ? Number(p.budget) : null
    })),
    totalRevenue: client.invoices.reduce((acc, inv) => acc + Number(inv.amount), 0),
    activeProjectsCount: client.projects.length,
    outstandingInvoicesCount: client.invoices.filter(inv => inv.status !== "PAID").length,
  }));
}

export async function getClientById(workspaceId: string, id: string): Promise<ClientWithDetails | null> {
  const { role } = await requireWorkspacePermission(workspaceId, "read", "client");

  const client = await prisma.client.findUnique({
    where: { id, workspaceId },
    include: {
      activities: {
        include: {
          actor: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      projects: { orderBy: { createdAt: "desc" } },
      invoices: { orderBy: { createdAt: "desc" } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!client) return null;

  // Mask financial data for roles without access
  const hasFinancialAccess = ["OWNER", "ADMIN", "PM"].includes(role);
  if (!hasFinancialAccess) {
    // @ts-ignore - we are filtering out data before sending to client
    client.invoices = [];
    // @ts-ignore
    client.projects = client.projects.map(p => ({ ...p, budget: null }));
  } else {
    // Convert decimals to numbers
    // @ts-ignore
    client.projects = client.projects.map(p => ({
        ...p,
        budget: p.budget ? Number(p.budget) : null
    }));
  }

  return client as unknown as ClientWithDetails;
}

export async function createClient(workspaceId: string, data: any) {
  const { user } = await requireWorkspacePermission(workspaceId, "create", "client");
  
  const validated = clientSchema.parse(data);

  const client = await prisma.$transaction(async (tx) => {
    const newClient = await tx.client.create({
      data: {
        ...validated,
        workspaceId,
      },
    });

    await tx.clientActivity.create({
      data: {
        clientId: newClient.id,
        actorId: user.id!,
        action: "CREATED",
        content: `Client ${newClient.companyName} was created.`,
      },
    });

    return newClient;
  });

  revalidateTag("clients");
  revalidateTag(`workspace-${workspaceId}`);
  revalidatePath("/dashboard/clients");
  return client;
}

export async function updateClient(workspaceId: string, id: string, data: any) {
  const { user } = await requireWorkspacePermission(workspaceId, "update", "client");
  
  const validated = clientUpdateSchema.parse(data);

  const client = await prisma.$transaction(async (tx) => {
    const updatedClient = await tx.client.update({
      where: { id, workspaceId },
      data: validated,
    });

    await tx.clientActivity.create({
      data: {
        clientId: id,
        actorId: user.id!,
        action: "UPDATED",
        content: "Client information was updated.",
      },
    });

    return updatedClient;
  });

  revalidateTag("clients");
  revalidateTag(`client-${id}`);
  revalidateTag(`workspace-${workspaceId}`);
  revalidatePath(`/dashboard/clients/${id}`);
  revalidatePath("/dashboard/clients");
  return client;
}

export async function getClientStats(workspaceId: string, id: string) {
  const { role } = await requireWorkspacePermission(workspaceId, "read", "client");
  
  const hasFinancialAccess = ["OWNER", "ADMIN", "PM"].includes(role);

  const stats = await prisma.client.findUnique({
    where: { id, workspaceId },
    select: {
      invoices: {
        select: {
          amount: true,
          status: true,
        }
      },
      projects: {
        where: {
          status: { notIn: ["COMPLETED", "CANCELLED"] }
        },
        select: {
          id: true
        }
      }
    }
  });

  if (!stats) return null;

  return {
    totalRevenue: hasFinancialAccess ? stats.invoices.reduce((acc, inv) => acc + inv.amount, 0) : null,
    activeProjects: stats.projects.length,
    outstandingInvoices: hasFinancialAccess ? stats.invoices.filter(inv => inv.status !== "PAID").length : null,
  };
}

export async function getClientTimeline(workspaceId: string, id: string) {
  await requireWorkspacePermission(workspaceId, "read", "client");

  return await prisma.clientActivity.findMany({
    where: { clientId: id },
    include: {
      actor: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
