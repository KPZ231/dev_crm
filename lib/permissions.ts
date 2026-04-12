import { WorkspaceRole } from "@prisma/client";

// Role mapping assumption:
// OWNER -> owner
// ADMIN -> admin
// MANAGER -> PM
// MEMBER -> developer / sales
// VIEWER -> read only

export const canManageLeads = (role: WorkspaceRole) => {
  return ["OWNER", "ADMIN", "PM", "SALES"].includes(role);
};

export const canDeleteLeads = (role: WorkspaceRole) => {
  return ["OWNER", "ADMIN"].includes(role);
};

export const canManageClients = (role: WorkspaceRole) => {
  return ["OWNER", "ADMIN", "PM", "SALES"].includes(role);
};

export const canViewClientFinancials = (role: WorkspaceRole) => {
  return ["OWNER", "ADMIN", "PM"].includes(role);
};

export const canViewRevenue = (role: WorkspaceRole) => {
  return ["OWNER", "ADMIN"].includes(role);
};

export const canViewFinancials = (role: WorkspaceRole) => {
  // potentialValue hidden for developer
  return role !== "DEVELOPER";
};
