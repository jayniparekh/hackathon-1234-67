"use client";

import { useState } from "react";
import {
  Calendar,
  Eye,
  PaperPlaneTilt,
  Clock,
  Hash,
  Lightning,
  Camera,
  MusicNotes,
  Robot,
  Bird,
  Briefcase,
  ChatCircle,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const PLATFORMS = [
  {
    id: "twitter",
    name: "Twitter",
    Icon: Bird,
    color: "bg-black",
    maxChars: 280,
    connected: true,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    Icon: Briefcase,
    color: "bg-blue-600",
    maxChars: 3000,
    connected: true,
  },
  {
    id: "instagram",
    name: "Instagram",
    Icon: Camera,
    color: "bg-gradient-to-r from-pink-500 to-amber-400",
    maxChars: 2200,
    connected: false,
  },
  {
    id: "facebook",
    name: "Facebook",
    Icon: ChatCircle,
    color: "bg-blue-500",
    maxChars: 63206,
    connected: true,
  },
  {
    id: "tiktok",
    name: "TikTok",
    Icon: MusicNotes,
    color: "bg-black",
    maxChars: 150,
    connected: false,
  },
  {
    id: "reddit",
    name: "Reddit",
    Icon: Robot,
    color: "bg-orange-500",
    maxChars: 10000,
    connected: true,
  },
];

const PRESETS = [
  { id: "optimal", label: "Optimal Times", description: "Post at predicted peak hours" },
  { id: "immediate", label: "Immediate", description: "Publish now" },
  { id: "scheduled", label: "Scheduled", description: "Custom date & time" },
];

export default function DistributePage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "twitter",
    "linkedin",
  ]);
  const [timePreset, setTimePreset] = useState("optimal");
  const [scheduledTime, setScheduledTime] = useState("");
  const [selectedTab, setSelectedTab] = useState("preview");
  const [showABTest, setShowABTest] = useState(false);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b-2 border-border bg-secondary-background px-8 py-6 shadow-[var(--shadow)]">
        <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-foreground">
          Multi-Platform Publisher
        </h1>
        <p className="mt-2 text-foreground/70">
          One master piece becomes platform-optimized posts. Schedule, preview,
          A/B test, and publish everywhere in seconds.
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Configuration */}
        <div className="flex w-1/3 flex-col gap-6 overflow-y-auto border-r-2 border-border p-8">
          {/* Platform Selection */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-foreground">
              Select Platforms
            </label>
            <div className="space-y-2">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  disabled={!platform.connected && !selectedPlatforms.includes(platform.id)}
                  className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                    selectedPlatforms.includes(platform.id)
                      ? "border-main bg-main/5"
                      : platform.connected
                        ? "border-border bg-background hover:bg-secondary-background"
                        : "border-border bg-background opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-lg p-2 w-10 h-10 flex items-center justify-center ${platform.color} text-white`}
                      >
                        <platform.Icon size={20} weight="duotone" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {platform.name}
                        </p>
                        <p className="text-xs text-foreground/60">
                          {platform.maxChars} char limit
                        </p>
                      </div>
                    </div>
                    {!platform.connected && (
                      <p className="text-xs font-semibold text-amber-600">
                        Connect
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Scheduling */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-foreground">
              When to Publish
            </label>
            <div className="space-y-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setTimePreset(preset.id)}
                  className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                    timePreset === preset.id
                      ? "border-main bg-main/5"
                      : "border-border bg-background hover:bg-secondary-background"
                  }`}
                >
                  <p className="font-semibold text-foreground">{preset.label}</p>
                  <p className="text-xs text-foreground/60">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {timePreset === "scheduled" && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Date & Time
              </label>
              <Input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="border-2 border-border"
              />
            </div>
          )}

          {/* AI Suggestions */}
          <Card className="border-2 border-border bg-secondary-background p-4">
            <div className="flex items-start gap-2">
              <Lightning size={16} weight="duotone" className="mt-1 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  AI Suggestions
                </p>
                <p className="mt-1 text-xs text-foreground/70">
                  Best time: <span className="font-bold">3 PM ET Tuesday</span>
                </p>
                <p className="mt-1 text-xs text-foreground/70">
                  Trending hashtags: #AI #ContentCreation
                </p>
              </div>
            </div>
          </Card>

          {/* A/B Testing */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <input
                type="checkbox"
                checked={showABTest}
                onChange={(e) => setShowABTest(e.target.checked)}
                className="cursor-pointer"
              />
              A/B Test Variations
            </label>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button className="w-full rounded-lg border-2 border-border bg-background text-foreground hover:bg-main hover:text-main-foreground font-semibold">
              <Eye size={16} weight="duotone" className="mr-2" /> Preview All
            </Button>
            <Button className="w-full rounded-lg border-2 border-main bg-main text-main-foreground font-bold hover:shadow-lg">
              <PaperPlaneTilt size={16} weight="duotone" className="mr-2" /> Publish Now
            </Button>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Tabs */}
          <div className="border-b-2 border-border bg-secondary-background p-4">
            <div className="flex gap-2">
              {["preview", "schedule", "analytics"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all capitalize ${
                    selectedTab === tab
                      ? "bg-main text-main-foreground"
                      : "bg-background text-foreground hover:bg-secondary-background"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Content */}
          {selectedTab === "preview" && (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="space-y-6">
                {selectedPlatforms.map((platformId) => {
                  const platform = PLATFORMS.find((p) => p.id === platformId);
                  return (
                    <Card
                      key={platformId}
                      className="border-2 border-border bg-secondary-background p-6"
                    >
                      <div className="mb-4 flex items-center gap-2">
                        <div
                          className={`rounded-lg p-2 w-8 h-8 flex items-center justify-center ${platform?.color} text-white text-xs font-bold`}
                        >
                          {platform?.icon}
                        </div>
                        <h3 className="font-bold text-foreground">
                          {platform?.name}
                        </h3>
                      </div>
                      <div className="rounded-lg bg-background p-4">
                        <p className="text-sm text-foreground leading-relaxed">
                          Your content adapted for {platform?.name}. This preview
                          shows how your post will appear on the platform with
                          optimized formatting, hashtags, and media placement.
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-foreground/60">
                        <Clock size={14} weight="duotone" />
                        {timePreset === "optimal"
                          ? "Scheduled for optimal time"
                          : "Ready to publish immediately"}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Schedule View */}
          {selectedTab === "schedule" && (
            <div className="flex-1 overflow-y-auto p-8">
              <Card className="border-2 border-border bg-secondary-background p-6">
                <h3 className="mb-4 font-bold text-foreground">Publishing Schedule</h3>
                <div className="space-y-3">
                  {selectedPlatforms.map((platformId) => {
                    const platform = PLATFORMS.find((p) => p.id === platformId);
                    return (
                      <div
                        key={platformId}
                        className="flex items-center justify-between rounded-lg bg-background p-3"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar size={16} weight="duotone" className="text-main" />
                          <span className="font-semibold text-foreground">
                            {platform?.name}
                          </span>
                        </div>
                        <span className="text-sm text-foreground/60">
                          Tue 3:00 PM EST
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* Analytics */}
          {selectedTab === "analytics" && (
            <div className="flex-1 overflow-y-auto p-8">
              <Card className="border-2 border-border bg-secondary-background p-6">
                <h3 className="mb-4 font-bold text-foreground">
                  Predicted Analytics
                </h3>
                <div className="space-y-3">
                  {selectedPlatforms.map((platformId) => {
                    const platform = PLATFORMS.find((p) => p.id === platformId);
                    const predictions = {
                      twitter: { likes: 150, retweets: 45, replies: 20 },
                      linkedin: { likes: 320, comments: 18, shares: 12 },
                      facebook: { likes: 280, comments: 42, shares: 25 },
                      reddit: { upvotes: 450, comments: 65 },
                    }[platformId] || {};

                    return (
                      <div
                        key={platformId}
                        className="rounded-lg bg-background p-3"
                      >
                        <p className="mb-2 font-semibold text-foreground">
                          {platform?.name}
                        </p>
                        <div className="space-y-1 text-sm text-foreground/70">
                          {Object.entries(predictions).map(([key, value]) => (
                            <p key={key}>
                              {key.charAt(0).toUpperCase() + key.slice(1)}:{" "}
                              <span className="font-bold text-main">
                                {value}
                              </span>
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
