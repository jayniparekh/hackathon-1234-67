export const TRENDS_CACHE_TTL_SEC = 300;

export const NICHE_OPTIONS = [
  { value: "tech_ai", label: "Tech & AI", query: "artificial intelligence AI tech" },
  { value: "finance", label: "Finance", query: "crypto stock market finance" },
  { value: "entertainment", label: "Entertainment", query: "movies music celebrity" },
  { value: "gaming", label: "Gaming", query: "gaming esports video games" },
  { value: "lifestyle", label: "Lifestyle", query: "lifestyle wellness fitness" },
] as const;

export type NicheValue = (typeof NICHE_OPTIONS)[number]["value"];

export type TrendItem = {
  id: string;
  title: string;
  source: string;
  mentionCount?: number;
  link?: string;
  niche: NicheValue;
};

export type StrategyResult = {
  angles: string[];
  youtubeHook: string;
  reelConcept: string;
};

export const REDIS_TRENDS_KEY_PREFIX = "strategy:trends:";
