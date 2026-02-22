import { NextRequest, NextResponse } from "next/server";
import {
  TRENDS_CACHE_TTL_SEC,
  REDIS_TRENDS_KEY_PREFIX,
  NICHE_OPTIONS,
  type TrendItem,
  type NicheValue,
} from "@/lib/strategy-config";
import { getCached, setCached } from "@/lib/redis";

function mockTrends(niche: NicheValue): TrendItem[] {
  const titles: Record<NicheValue, string[]> = {
    tech_ai: ["Open source LLMs", "AI agents", "Multimodal AI", "AI coding tools", "Edge AI"],
    finance: ["Bitcoin ETF", "Fed rates", "Meme stocks", "DeFi trends", "Inflation data"],
    entertainment: ["Streaming hits", "Award season", "Viral music", "Film releases", "Celebrity news"],
    gaming: ["New game launch", "Esports meta", "Console updates", "Indie hits", "Gaming hardware"],
    lifestyle: ["Wellness trends", "Fitness challenges", "Diet trends", "Travel hotspots", "Home routines"],
  };
  const list = titles[niche] ?? titles.tech_ai;
  return list.slice(0, 5).map((title, i) => ({
    id: `${niche}-${i}-${Date.now()}`,
    title,
    source: "Google Trends",
    mentionCount: 10000 * (5 - i),
    niche,
  }));
}

async function fetchSerpApi(niche: NicheValue): Promise<TrendItem[]> {
  const key = process.env.SERPAPI_KEY;
  if (!key) return mockTrends(niche);
  const option = NICHE_OPTIONS.find((o) => o.value === niche) ?? NICHE_OPTIONS[0];
  const params = new URLSearchParams({
    engine: "google_trends",
    q: option.query,
    data_type: "RELATED_QUERIES",
    date: "now 1-d",
    api_key: key,
  });
  const res = await fetch(`https://serpapi.com/search?${params.toString()}`, { next: { revalidate: 0 } });
  if (!res.ok) return mockTrends(niche);
  const data = (await res.json()) as {
    related_queries?: { rising?: Array<{ query?: string }>; top?: Array<{ query?: string }> };
  };
  const rising = data?.related_queries?.rising ?? [];
  const top = data?.related_queries?.top ?? [];
  const combined = [...rising, ...top];
  const seen = new Set<string>();
  const items: TrendItem[] = [];
  for (const item of combined) {
    const title = (item.query ?? "").trim();
    if (!title || seen.has(title.toLowerCase())) continue;
    seen.add(title.toLowerCase());
    items.push({ id: `${niche}-${items.length}-${title.slice(0, 20).replace(/\s/g, "_")}`, title, source: "Google Trends", niche });
    if (items.length >= 5) break;
  }
  if (items.length === 0) return mockTrends(niche);
  return items;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const niche = (searchParams.get("niche") ?? "tech_ai") as NicheValue;
  const validNiche = NICHE_OPTIONS.some((o) => o.value === niche) ? niche : "tech_ai";
  const cacheKey = `${REDIS_TRENDS_KEY_PREFIX}${validNiche}`;
  const cached = await getCached<TrendItem[]>(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return NextResponse.json({ trends: cached, cached: true });
  }
  const trends = await fetchSerpApi(validNiche);
  await setCached(cacheKey, trends, TRENDS_CACHE_TTL_SEC);
  return NextResponse.json({ trends, cached: false });
}
