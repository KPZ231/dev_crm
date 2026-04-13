import { Invoice, Client, InvoiceStatus } from "@prisma/client";

export type PeriodType = "monthly" | "quarterly" | "yearly";

export interface RevenueDataPoint {
  label: string; // e.g. "Jan", "Q1", "2024"
  revenue: number;
  count: number;
  date: Date;
}

export interface RevenueKPIs {
  mrr: number;
  currentMonthRevenue: number;
  overdueInvoicesAmount: number;
  paidYtd: number;
  growth: number; // percentage
}

export interface RevenueComparison {
  currentPeriodTotal: number;
  previousPeriodTotal: number;
  difference: number;
  percentageChange: number;
  bestMonth: { label: string; value: number };
  worstMonth: { label: string; value: number };
}

export type InvoiceWithClient = Omit<Invoice, "amount"> & {
  amount: number;
  client: Pick<Client, "id" | "companyName">;
};

export interface InvoiceFilters {
  status?: InvoiceStatus;
  clientId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}
