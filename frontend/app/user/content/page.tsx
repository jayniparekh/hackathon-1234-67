"use client";

import { useState } from "react";
import { Upload, Link as LinkIcon, FileText, Volume2, Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const OUTPUT_FORMATS = [
  { id: "text", label: "Text", icon: "📝" },
  { id: "audio", label: "Audio", icon: "🎙️" },
  { id: "video", label: "Video Script", icon: "🎬" },
];

const CONTENT_TYPES = [
  { id: "blog", label: "Blog Post", description: "Long-form article" },
  { id: "social", label: "Social Post", description: "Optimized for platforms" },
  { id: "email", label: "Email Campaign", description: "Newsletter or promo" },
  { id: "script", label: "Video Script", description: "Engaging video content" },
  { id: "ad", label: "Ad Copy", description: "High-converting ads" },
];

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<"text" | "url" | "file">("text");
  const [inputText, setInputText] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("text");
  const [selectedContentType, setSelectedContentType] = useState("blog");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Mock generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setGeneratedContent(
      "Your AI-generated content will appear here with full customization options. The system analyzes your input, applies your brand voice, and generates polished output ready to publish."
    );
    setIsGenerating(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b-2 border-border bg-secondary-background px-8 py-6 shadow-[var(--shadow)]">
        <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-foreground">
          Content Creator
        </h1>
        <p className="mt-2 text-foreground/70">
          Multi-modal intelligent content creation. Paste ideas, upload files,
          share URLs, or use templates. AI drafts and refines automatically.
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Input */}
        <div className="flex w-1/2 flex-col gap-6 overflow-y-auto border-r-2 border-border p-8">
          {/* Input Method Tabs */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-foreground">
              Input Source
            </label>
            <div className="flex gap-2">
              {[
                { id: "text", label: "💡 Idea", icon: "text" },
                { id: "url", label: "🔗 URL", icon: "url" },
                { id: "file", label: "📎 File", icon: "file" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? "border-main bg-main text-main-foreground"
                      : "border-border bg-background text-foreground hover:bg-secondary-background"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          {activeTab === "text" && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Your Idea or Brief
              </label>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Describe your content idea. The more specific, the better. Include audience, tone, key points..."
                className="h-40 border-2 border-border rounded-lg"
              />
            </div>
          )}

          {activeTab === "url" && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Paste URL
              </label>
              <div className="flex gap-2">
                <Input
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="border-2 border-border"
                />
                <Button className="border-2 border-main bg-main text-main-foreground rounded-lg ">
                  <LinkIcon size={16} />
                </Button>
              </div>
              <p className="mt-2 text-xs text-foreground/50">
                We'll extract and analyze the content from this URL.
              </p>
            </div>
          )}

          {activeTab === "file" && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Upload File
              </label>
              <div className="rounded-lg border-2 border-dashed border-border bg-background p-8 text-center">
                <Upload className="mx-auto mb-2 text-main" size={32} />
                <p className="text-sm font-semibold text-foreground">
                  Drop file or click to upload
                </p>
                <p className="text-xs text-foreground/50">PDF, TXT, DOCX supported</p>
              </div>
            </div>
          )}

          {/* Output Format */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-foreground">
              Output Format
            </label>
            <div className="flex gap-2">
              {OUTPUT_FORMATS.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all ${
                    selectedFormat === format.id
                      ? "border-main bg-main text-main-foreground"
                      : "border-border bg-background text-foreground hover:bg-secondary-background"
                  }`}
                >
                  {format.icon} {format.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Type */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-foreground">
              Content Type
            </label>
            <div className="space-y-2">
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedContentType(type.id)}
                  className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                    selectedContentType === type.id
                      ? "border-main bg-main/5"
                      : "border-border bg-background hover:bg-secondary-background"
                  }`}
                >
                  <p className="font-semibold text-foreground">{type.label}</p>
                  <p className="text-xs text-foreground/60">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || (!inputText && !inputUrl)}
            className="w-full rounded-lg border-2 border-main bg-main py-4 text-main-foreground font-bold hover:shadow-lg disabled:opacity-50"
          >
            <Plus size={18} className="mr-2" />
            {isGenerating ? "Generating..." : "Generate Content"}
          </Button>
        </div>

        {/* Right Panel - Output */}
        <div className="flex w-1/2 flex-col overflow-y-auto bg-secondary-background p-8">
          <div>
            <h2 className="mb-4 text-lg font-bold text-foreground">
              Generated Content
            </h2>
            {generatedContent ? (
              <Card className="border-2 border-border bg-background p-6">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {generatedContent}
                </p>
              </Card>
            ) : (
              <Card className="border-2 border-dashed border-border bg-background p-12 text-center">
                <p className="text-foreground/40">Your generated content will appear here</p>
              </Card>
            )}
          </div>

          {generatedContent && (
            <div className="mt-6 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button className="rounded-lg border-2 border-border bg-background text-foreground hover:bg-main hover:text-main-foreground">
                  ✏️ Edit
                </Button>
                <Button className="rounded-lg border-2 border-border bg-background text-foreground hover:bg-main hover:text-main-foreground">
                  🔄 Regenerate
                </Button>
              </div>
              <Button className="w-full rounded-lg border-2 border-main bg-main text-main-foreground font-semibold hover:shadow-lg">
                ✓ Use This Content
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
