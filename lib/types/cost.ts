import { Cost, Project, CostCategory, CostType } from "@prisma/client";

export type CostWithProject = Cost & {
  project?: Pick<Project, "id" | "name"> | null;
};

export interface CostsKPIs {
  fixedMonthlyCosts: number;
  variableYtd: number;
  totalCosts: number;
  totalRevenue: number;
  grossMargin: number; // percentage
}

export interface CategoryBreakdown {
  category: CostCategory;
  amount: number;
  percentage: number;
}

export interface ProjectCostSummaryData {
  projectId: string;
  projectName: string;
  totalBudget: number;
  totalCosts: number;
  margin: number;
  progress: number; // percentage of budget
  breakdown: CategoryBreakdown[];
}

export interface MonthlyCostPoint {
  month: string;
  [key: string]: string | number; // For stacked bar chart categories
}
