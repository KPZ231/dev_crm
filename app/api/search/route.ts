import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ScraperAPI } from "@/lib/integrations/scraper-api";
import { searchRequestSchema } from "@/lib/schemas/search";
import { prisma } from "@/lib/prisma";

// Basic rate limiting in-memory (per workspace)
const lastRequestTime = new Map<string, number>();
const RATE_LIMIT_MS = 2000; // 2 seconds between starts

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const membership = await prisma.workspaceMember.findFirst({
        where: { userId: session.user.id }
    });
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Rate limiting check
    const now = Date.now();
    const lastTime = lastRequestTime.get(membership.workspaceId) || 0;
    if (now - lastTime < RATE_LIMIT_MS) {
        return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 });
    }
    lastRequestTime.set(membership.workspaceId, now);

    const body = await req.json();
    const validated = searchRequestSchema.parse(body);

    const jobId = await ScraperAPI.startScrape(validated.query, validated.limit);
    
    return NextResponse.json({ jobId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
        // List recent jobs as an alternative
        const h = await ScraperAPI.listRecentJobs();
        return NextResponse.json(h);
    }

    const status = await ScraperAPI.getJobStatus(jobId);
    return NextResponse.json(status);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
