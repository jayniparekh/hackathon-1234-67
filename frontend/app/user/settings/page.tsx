"use client";

import { useState } from "react";
import {
  User,
  Palette,
  Key,
  Zap,
  Save,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SOCIAL_PLATFORMS = [
  { id: "twitter", name: "Twitter", icon: "𝕏", connected: true },
  { id: "linkedin", name: "LinkedIn", icon: "in", connected: true },
  { id: "instagram", name: "Instagram", icon: "📷", connected: false },
  { id: "facebook", name: "Facebook", icon: "f", connected: false },
  { id: "tiktok", name: "TikTok", icon: "♪", connected: false },
];

const SECTIONS = [
  { id: "account", label: "Profile", icon: "👤" },
  { id: "brand", label: "Brand Voice", icon: "✨" },
  { id: "social", label: "Social Accounts", icon: "🔗" },
  { id: "api", label: "API Keys", icon: "🔑" },
  { id: "models", label: "Model Config", icon: "🤖" },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("account");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b-2 border-border bg-secondary-background px-8 py-6 shadow-[var(--shadow)]">
        <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-foreground">
          Settings
        </h1>
        <p className="mt-2 text-foreground/70">
          Manage your profile, brand voice, API integrations, and connected
          social accounts.
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-56 border-r-2 border-border bg-secondary-background p-4">
          <div className="space-y-2">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full rounded-lg border-2 px-4 py-3 text-left text-sm font-semibold transition-all ${
                  activeSection === section.id
                    ? "border-main bg-main text-main-foreground"
                    : "border-border bg-background text-foreground hover:bg-background"
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Account Settings */}
          {activeSection === "account" && (
            <div className="max-w-2xl space-y-6">
              <Card className="border-2 border-border bg-secondary-background p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                  <User size={20} /> Profile Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Full Name
                    </label>
                    <Input
                      defaultValue="Sarah Chen"
                      className="border-2 border-border"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Email
                    </label>
                    <Input
                      defaultValue="sarah.chen@example.com"
                      type="email"
                      className="border-2 border-border"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Company
                    </label>
                    <Input
                      defaultValue="ContentForge Inc."
                      className="border-2 border-border"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Bio
                    </label>
                    <Textarea
                      defaultValue="Content creator and AI enthusiast."
                      className="h-24 border-2 border-border"
                    />
                  </div>
                </div>
              </Card>

              <Card className="border-2 border-border bg-secondary-background p-6">
                <h2 className="mb-4 text-lg font-bold text-foreground">
                  Password & Security
                </h2>
                <Button className="border-2 border-border bg-background text-foreground hover:bg-main hover:text-main-foreground rounded-lg">
                  Change Password
                </Button>
              </Card>
            </div>
          )}

          {/* Brand Voice */}
          {activeSection === "brand" && (
            <div className="max-w-2xl space-y-6">
              <Card className="border-2 border-border bg-secondary-background p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                  <Palette size={20} /> Brand Voice Configuration
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Brand Name
                    </label>
                    <Input
                      defaultValue="ContentForge AI"
                      className="border-2 border-border"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Brand Tone
                    </label>
                    <Select defaultValue="professional">
                      <SelectTrigger className="border-2 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="humorous">Humorous</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Brand Voice & Guidelines
                    </label>
                    <Textarea
                      defaultValue="We speak directly to creators and marketers. Use clear, actionable language. Avoid jargon. Always explain the 'why' behind recommendations."
                      className="h-32 border-2 border-border"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Upload Brand Guidelines (PDF)
                    </label>
                    <div className="rounded-lg border-2 border-dashed border-border bg-background p-6 text-center">
                      <p className="text-sm text-foreground/60">Upload PDF</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Social Account Connections */}
          {activeSection === "social" && (
            <div className="max-w-2xl space-y-6">
              <Card className="border-2 border-border bg-secondary-background p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                  🔗 Connected Accounts
                </h2>
                <div className="space-y-3">
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <div
                      key={platform.id}
                      className="flex items-center justify-between rounded-lg border-2 border-border bg-background p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{platform.icon}</div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {platform.name}
                          </p>
                          <p className="text-xs text-foreground/60">
                            {platform.connected
                              ? "Connected as @username"
                              : "Not connected"}
                          </p>
                        </div>
                      </div>
                      <Button
                        className={`rounded-lg border-2 ${
                          platform.connected
                            ? "border-red-500 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white"
                            : "border-main bg-main text-main-foreground"
                        }`}
                      >
                        {platform.connected ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* API Keys */}
          {activeSection === "api" && (
            <div className="max-w-2xl space-y-6">
              <Card className="border-2 border-border bg-secondary-background p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                  <Key size={20} /> API Keys
                </h2>
                <p className="mb-4 text-sm text-foreground/70">
                  Use your API key to integrate ContentForge with your own
                  applications.
                </p>

                <div className="space-y-4">
                  <div className="rounded-lg bg-background p-4">
                    <p className="mb-2 text-xs font-semibold text-foreground/60">
                      Production Key
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        defaultValue="sk_live_...abcd1234xyz"
                        readOnly
                        className="border-2 border-border"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="rounded-lg border-2 border-border p-2 hover:bg-secondary-background"
                      >
                        {showApiKey ? (
                          <EyeOff size={16} className="text-foreground" />
                        ) : (
                          <Eye size={16} className="text-foreground" />
                        )}
                      </button>
                      <button className="rounded-lg border-2 border-border p-2 hover:bg-secondary-background">
                        <Copy size={16} className="text-foreground" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <Button className="w-full rounded-lg border-2 border-red-500 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white font-semibold">
                      Regenerate Key
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="border-2 border-border bg-secondary-background p-6">
                <h2 className="mb-4 text-lg font-bold text-foreground">
                  Webhook Configuration
                </h2>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Webhook URL
                  </label>
                  <Input
                    placeholder="https://your-domain.com/webhooks/contentforge"
                    className="border-2 border-border"
                  />
                </div>
              </Card>
            </div>
          )}

          {/* Model Configuration */}
          {activeSection === "models" && (
            <div className="max-w-2xl space-y-6">
              <Card className="border-2 border-border bg-secondary-background p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                  <Zap size={20} /> Model Fine-Tuning
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Default Writing Style
                    </label>
                    <Select defaultValue="balanced">
                      <SelectTrigger className="border-2 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Content Creativity Level
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="50"
                      className="w-full"
                    />
                    <div className="mt-1 flex justify-between text-xs text-foreground/60">
                      <span>Conservative</span>
                      <span>Creative</span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Model Version
                    </label>
                    <Select defaultValue="latest">
                      <SelectTrigger className="border-2 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latest">
                          Latest (v2.5)
                        </SelectItem>
                        <SelectItem value="stable">
                          Stable (v2.0)
                        </SelectItem>
                        <SelectItem value="beta">Beta (v3.0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Save Button */}
          <div className="fixed bottom-8 right-8">
            {savedAlert && (
              <div className="mb-2 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white shadow-lg">
                <Check size={18} />
                Saved successfully!
              </div>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-lg border-2 border-main bg-main px-6 py-4 text-main-foreground font-bold hover:shadow-lg disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
