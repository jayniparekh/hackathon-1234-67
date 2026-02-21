"use client";

import { useState } from "react";
import {
  Star,
  Copy,
  Eye,
  FileText,
  Bird,
  CurrencyDollar,
  FilmStrip,
  Envelope,
  Briefcase,
  ChartBar,
  Newspaper,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const TEMPLATE_CATEGORIES = [
  "All",
  "Blog Posts",
  "Tweets",
  "Scripts",
  "Ad Copy",
  "Email",
  "LinkedIn",
  "Press Release",
];

const TEMPLATES = [
  {
    id: 1,
    title: "SEO-Optimized Blog Post",
    category: "Blog Posts",
    description: "Long-form blog optimized for search with structure and keywords",
    Icon: FileText,
    rating: 4.8,
    uses: 2341,
    preview: "Write engaging blog posts with built-in SEO optimization...",
  },
  {
    id: 2,
    title: "Viral Tweet Thread",
    category: "Tweets",
    description: "Create engaging tweet threads that drive engagement",
    Icon: Bird,
    rating: 4.9,
    uses: 5420,
    preview: "Start strong, hook readers, build anticipation...",
  },
  {
    id: 3,
    title: "Product Ad Copy",
    category: "Ad Copy",
    description: "High-converting ad copy for social and paid campaigns",
    Icon: CurrencyDollar,
    rating: 4.7,
    uses: 3120,
    preview: "Headline + benefit + CTA structured for maximum conversions...",
  },
  {
    id: 4,
    title: "YouTube Script",
    category: "Scripts",
    description: "Structured scripts for video content with engagement hooks",
    Icon: FilmStrip,
    rating: 4.6,
    uses: 1890,
    preview: "Hook + intro + main content + call-to-action...",
  },
  {
    id: 5,
    title: "Newsletter Edition",
    category: "Email",
    description: "Curated newsletter with story + insights + CTA",
    Icon: Envelope,
    rating: 4.8,
    uses: 1650,
    preview: "Opening story + 3 insights + tool recommendation + sign-off...",
  },
  {
    id: 6,
    title: "LinkedIn Post",
    category: "LinkedIn",
    description: "Professional thought leadership posts",
    Icon: Briefcase,
    rating: 4.7,
    uses: 3800,
    preview: "Hook question + story + lesson + CTA for engagement...",
  },
  {
    id: 7,
    title: "Case Study",
    category: "Blog Posts",
    description: "In-depth case study with results and methodology",
    Icon: ChartBar,
    rating: 4.9,
    uses: 892,
    preview: "Situation + challenge + solution + results + lessons...",
  },
  {
    id: 8,
    title: "Press Release",
    category: "Press Release",
    description: "Professional press release format",
    Icon: Newspaper,
    rating: 4.5,
    uses: 567,
    preview: "Headline + dateline + summary + quotes + boilerplate...",
  },
];

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState<number[]>([]);

  const filteredTemplates = TEMPLATES.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b-2 border-border bg-secondary-background px-8 py-6 shadow-[var(--shadow)]">
        <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-foreground">
          Template Library
        </h1>
        <p className="mt-2 text-foreground/70">
          Choose from 50+ professionally crafted templates. Each adapts to your
          brand voice and output format. New templates added weekly.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="border-b-2 border-border bg-secondary-background px-8 py-4 shadow-sm">
        <div className="mb-4">
          <Input
            type="search"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-2 border-border"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full border-2 px-4 py-2 text-sm font-semibold shadow-[var(--shadow)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none ${
                selectedCategory === category
                  ? "border-main bg-main text-main-foreground"
                  : "border-border bg-background text-foreground hover:bg-secondary-background"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-8">
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-lg text-foreground/60">No templates found</p>
            <p className="text-sm text-foreground/40">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="border-2 border-border bg-secondary-background p-6 transition-all hover:border-main hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center text-main">
                    <template.Icon size={32} weight="duotone" />
                  </div>
                  <button
                    onClick={() => toggleFavorite(template.id)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={20}
                      weight={favorites.includes(template.id) ? "fill" : "regular"}
                      className={`${
                        favorites.includes(template.id)
                          ? "text-amber-400"
                          : "text-foreground/40"
                      }`}
                    />
                  </button>
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">
                  {template.title}
                </h3>
                <p className="mt-1 text-xs font-medium text-main">
                  {template.category}
                </p>
                <p className="mt-2 text-sm text-foreground/70">
                  {template.description}
                </p>
                <div className="mt-4 rounded-lg bg-background p-3">
                  <p className="text-xs text-foreground/60">{template.preview}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                      <Star size={14} weight="fill" />
                      {template.rating}
                    </span>
                    <span className="text-xs text-foreground/50">
                      ({template.uses} uses)
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    className="flex-1 border-2 border-border bg-background text-foreground hover:bg-main hover:text-main-foreground rounded-lg"
                  >
                    <Eye size={16} weight="duotone" className="mr-1" /> Preview
                  </Button>
                  <Button className="flex-1 rounded-lg border-2 border-main bg-main text-main-foreground hover:shadow-lg">
                    <Copy size={16} weight="duotone" className="mr-1" /> Use
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
