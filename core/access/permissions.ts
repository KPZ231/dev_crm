import { WorkspaceRole } from "@prisma/client";

// Core action types standardizing all business events
export type ActionType = "create" | "read" | "update" | "delete";

// Entities defined across modules for the overall CRM platform
export type ResourceType = 
  | "workspace"
  | "member"
  | "lead"
  | "client"
  | "document"
  | "task"
  | "cost"
  | "revenue"
  | "settings";

// Defines EXACTLY what roles can perform what actions on what resources
// This makes extending the CRM with new modules extremely simple later on.
export const PERMISSION_MATRIX: Record<ResourceType, Record<ActionType, WorkspaceRole[]>> = {
  workspace: {
    create: [],
    read:   ["OWNER", "ADMIN", "PM", "DEVELOPER", "SALES"],
    update: ["OWNER", "ADMIN"],
    delete: ["OWNER"],
  },
  member: {
    create: ["OWNER", "ADMIN"],
    read:   ["OWNER", "ADMIN", "PM", "DEVELOPER", "SALES"],
    update: ["OWNER", "ADMIN"],
    delete: ["OWNER", "ADMIN"],
  },
  lead: {
    create: ["OWNER", "ADMIN", "PM", "SALES"],
    read:   ["OWNER", "ADMIN", "PM", "DEVELOPER", "SALES"],
    update: ["OWNER", "ADMIN", "PM", "SALES"],
    delete: ["OWNER", "ADMIN", "PM"],
  },
  client: {
    create: ["OWNER", "ADMIN", "PM", "SALES"],
    read:   ["OWNER", "ADMIN", "PM", "DEVELOPER", "SALES"],
    update: ["OWNER", "ADMIN", "PM", "SALES"],
    delete: ["OWNER", "ADMIN"],
  },
  task: {
    create: ["OWNER", "ADMIN", "PM", "DEVELOPER"],
    read:   ["OWNER", "ADMIN", "PM", "DEVELOPER", "SALES"],
    update: ["OWNER", "ADMIN", "PM", "DEVELOPER"],
    delete: ["OWNER", "ADMIN", "PM"],
  },
  document: {
    create: ["OWNER", "ADMIN", "PM", "DEVELOPER", "SALES"],
    read:   ["OWNER", "ADMIN", "PM", "DEVELOPER", "SALES"],
    update: ["OWNER", "ADMIN", "PM", "DEVELOPER", "SALES"],
    delete: ["OWNER", "ADMIN"],
  },
  cost: {
    create: ["OWNER", "ADMIN", "PM"],
    read:   ["OWNER", "ADMIN", "PM", "DEVELOPER"],
    update: ["OWNER", "ADMIN", "PM"],
    delete: ["OWNER", "ADMIN"],
  },
  revenue: {
    create: ["OWNER", "ADMIN", "PM"],
    read:   ["OWNER", "ADMIN"],
    update: ["OWNER", "ADMIN"],
    delete: ["OWNER"],
  },
  settings: {
    create: ["OWNER", "ADMIN"],
    read:   ["OWNER", "ADMIN", "PM"],
    update: ["OWNER", "ADMIN"],
    delete: ["OWNER", "ADMIN"],
  }
};

/**
 * Validates if a role has the right to perform a specific action on a specific resource.
 */
export function hasPermission(
  role: WorkspaceRole, 
  action: ActionType, 
  resource: ResourceType
): boolean {
  return PERMISSION_MATRIX[resource][action].includes(role);
}
