import { 
  LayoutDashboard, 
  Target, 
  Users, 
  Briefcase, 
  CheckSquare, 
  FileText, 
  TrendingUp, 
  Wallet, 
  Settings 
} from "lucide-react";
import { WorkspaceRole } from "@prisma/client";

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  roles: WorkspaceRole[];
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["OWNER", "ADMIN", "PM", "DEVELOPER", "SALES"],
  },
  {
    title: "Leady",
    href: "/dashboard/leads",
    icon: Target,
    roles: ["OWNER", "ADMIN", "PM", "DEVELOPER", "SALES"],
  },
  {
    title: "Klienci",
    href: "/dashboard/clients",
    icon: Users,
    roles: ["OWNER", "ADMIN", "PM", "DEVELOPER", "SALES"],
  },
  {
    title: "Projekty",
    href: "/dashboard/projects",
    icon: Briefcase,
    roles: ["OWNER", "ADMIN", "PM", "DEVELOPER"],
  },
  {
    title: "Taski",
    href: "/dashboard/tasks/kanban",
    icon: CheckSquare,
    roles: ["OWNER", "ADMIN", "PM", "DEVELOPER", "SALES"],
  },
  {
    title: "Dokumenty",
    href: "/dashboard/documents",
    icon: FileText,
    roles: ["OWNER", "ADMIN", "PM", "DEVELOPER", "SALES"],
  },
  {
    title: "Revenue",
    href: "/dashboard/revenue",
    icon: TrendingUp,
    roles: ["OWNER", "ADMIN"],
  },
  {
    title: "Koszty",
    href: "/dashboard/costs",
    icon: Wallet,
    roles: ["OWNER", "ADMIN", "PM"],
  },
  {
    title: "Admin",
    href: "/dashboard/admin",
    icon: Settings,
    roles: ["OWNER", "ADMIN"],
  },
];

export function getSidebarItems(role: WorkspaceRole) {
  return NAVIGATION_ITEMS.filter((item) => item.roles.includes(role));
}
