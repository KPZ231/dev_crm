export interface SearchResult {
  id: string;
  name: string;
  category: string;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  rating?: number | null;
  reviewsCount?: number | null;
  source: "external" | "internal";
  url?: string | null;
}

export interface SearchJobResponse {
  jobId: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  results: SearchResult[];
}
