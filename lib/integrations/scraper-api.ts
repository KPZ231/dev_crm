import { SearchJobResponse, SearchResult } from "@/lib/types/search";

const BASE_URL = "https://scraper-bdxt.onrender.com";

export class ScraperAPI {
  private static async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Scraper API returned ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }

  static async startScrape(query: string, limit: number = 10): Promise<string> {
    const data = await this.request("/api/scrape", {
      method: "POST",
      body: JSON.stringify({ query, limit, headless: true }),
    });
    return data.job_id;
  }

  static async getJobStatus(jobId: string): Promise<SearchJobResponse> {
    const data = await this.request(`/api/jobs/${jobId}`);
    
    // Map external results to our unified SearchResult format
    const results: SearchResult[] = (data.results || []).map((r: any) => ({
      id: r.google_id || Math.random().toString(36),
      name: r.name,
      category: r.category,
      address: r.address,
      phone: r.phone,
      website: r.website,
      rating: r.rating,
      reviewsCount: r.reviews_count,
      source: "external",
      url: r.map_url
    }));

    return {
      jobId: data.job_id,
      status: data.status,
      progress: data.progress,
      results
    };
  }

  static async listRecentJobs(): Promise<any[]> {
      return this.request("/api/jobs");
  }
}
