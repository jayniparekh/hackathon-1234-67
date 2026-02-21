"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  TrendUp,
  Lightning,
  ChatCircle,
  CurrencyDollar,
  WarningCircle,
  CheckCircle,
  Check,
  ChartLineUp,
  Target,
  Clock,
  Smiley,
  Brain,
  Fire,
  Thermometer,
  Lightbulb,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";

// Sample data
const performanceTrend = [
  { date: "Jan 1", engagement: 45, sentiment: 72, roi: 120 },
  { date: "Jan 8", engagement: 58, sentiment: 75, roi: 145 },
  { date: "Jan 15", engagement: 72, sentiment: 78, roi: 180 },
  { date: "Jan 22", engagement: 85, sentiment: 81, roi: 220 },
  { date: "Jan 29", engagement: 92, sentiment: 84, roi: 265 },
  { date: "Feb 5", engagement: 106, sentiment: 86, roi: 310 },
  { date: "Feb 12", engagement: 118, sentiment: 87, roi: 365 },
  { date: "Feb 21", engagement: 132, sentiment: 89, roi: 420 },
];

const contentFormatPerformance = [
  { format: "Blog", engagement: 95, reach: 2400, roi: 850 },
  { format: "Video", engagement: 120, reach: 3200, roi: 1200 },
  { format: "Infographic", engagement: 85, reach: 2100, roi: 920 },
  { format: "Carousel", engagement: 110, reach: 2900, roi: 1050 },
  { format: "Newsletter", engagement: 78, reach: 1800, roi: 680 },
];

const optimalTimes = [
  { hour: "6 AM", engagement: 15 },
  { hour: "9 AM", engagement: 62 },
  { hour: "12 PM", engagement: 85 },
  { hour: "3 PM", engagement: 92 },
  { hour: "6 PM", engagement: 88 },
  { hour: "9 PM", engagement: 72 },
  { hour: "12 AM", engagement: 28 },
];

const sentimentDistribution = [
  { name: "Positive", value: 45, color: "#10b981" },
  { name: "Neutral", value: 35, color: "#6b7280" },
  { name: "Negative", value: 15, color: "#ef4444" },
  { name: "Mixed", value: 5, color: "#f59e0b" },
];

const contentPerformance = [
  { id: 1, title: "Product Launch", engagement: 95, sentiment: 88, predicted: 105 },
  { id: 2, title: "How-To Guide", engagement: 78, sentiment: 82, predicted: 85 },
  { id: 3, title: "Case Study", engagement: 110, sentiment: 91, predicted: 125 },
  { id: 4, title: "Industry News", engagement: 65, sentiment: 72, predicted: 70 },
  { id: 5, title: "Customer Testimonial", engagement: 120, sentiment: 94, predicted: 135 },
];

const learningLoopInsights = [
  {
    type: "success",
    insight: "Video content in afternoon slots generates 40% more engagement",
    impact: "High",
  },
  {
    type: "success",
    insight: "Narrative-consistent posts have 25% better sentiment scores",
    impact: "High",
  },
  { type: "warning", insight: "Blog posts on Monday underperform by 15%", impact: "Medium" },
  {
    type: "success",
    insight: "Formal tone correlates with higher ROI in B2B content",
    impact: "High",
  },
];

const MetricCard = ({
  label,
  value,
  change,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}) => (
  <Card className="border-2 border-border bg-gradient-to-br from-secondary-background to-background p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-foreground/60">{label}</p>
        <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
        <p className="mt-1 text-xs font-semibold text-green-600">↑ {change}</p>
      </div>
      <div className={`rounded-lg p-3 ${color}`}>{Icon}</div>
    </div>
  </Card>
);

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b-2 border-border bg-secondary-background px-8 py-6 shadow-[var(--shadow)]">
        <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-foreground">
          Analytics Dashboard
        </h1>
        <p className="mt-2 text-foreground/70">
          Performance heatmaps, engagement predictions, sentiment scores, and ROI insights.
          Data feeds back into models for smarter suggestions.
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <MetricCard
            label="Engagement"
            value="132"
            change="18% this week"
            icon={<Lightning className="text-white" size={24} weight="duotone" />}
            color="bg-blue-500"
          />
          <MetricCard
            label="Sentiment Score"
            value="89/100"
            change="5 points up"
            icon={<ChatCircle className="text-white" size={24} weight="duotone" />}
            color="bg-green-500"
          />
          <MetricCard
            label="ROI"
            value="$420K"
            change="28% growth"
            icon={<CurrencyDollar className="text-white" size={24} weight="duotone" />}
            color="bg-purple-500"
          />
          <MetricCard
            label="Prediction Accuracy"
            value="94%"
            change="2% improved"
            icon={<TrendUp className="text-white" size={24} weight="duotone" />}
            color="bg-amber-500"
          />
        </div>

        {/* Performance Trend Chart */}
        <div className="mb-8">
          <Card className="border-2 border-border bg-secondary-background p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <ChartLineUp size={22} weight="duotone" />
              Performance Over Time
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-foreground)" />
                <YAxis stroke="var(--color-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-secondary-background)",
                    border: "2px solid var(--color-border)",
                    borderRadius: "var(--radius-base)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="engagement"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="sentiment"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="roi"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Content Format Performance & Optimal Times */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Format Performance */}
          <Card className="border-2 border-border bg-secondary-background p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <Target size={22} weight="duotone" />
              Content Format Performance
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contentFormatPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="format" stroke="var(--color-foreground)" />
                <YAxis stroke="var(--color-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-secondary-background)",
                    border: "2px solid var(--color-border)",
                    borderRadius: "var(--radius-base)",
                  }}
                />
                <Legend />
                <Bar dataKey="engagement" fill="#3b82f6" />
                <Bar dataKey="roi" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Optimal Posting Times */}
          <Card className="border-2 border-border bg-secondary-background p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <Clock size={22} weight="duotone" />
              Optimal Posting Times
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={optimalTimes}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="hour" stroke="var(--color-foreground)" />
                <YAxis stroke="var(--color-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-secondary-background)",
                    border: "2px solid var(--color-border)",
                    borderRadius: "var(--radius-base)",
                  }}
                />
                <Bar dataKey="engagement" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Sentiment Analysis & Learning Loop */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Sentiment Distribution */}
          <Card className="border-2 border-border bg-secondary-background p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <Smiley size={22} weight="duotone" />
              Sentiment Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Learning Loop Feedback */}
          <Card className="border-2 border-border bg-secondary-background p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <Brain size={22} weight="duotone" />
              Learning Loop Insights
            </h2>
            <div className="space-y-3">
              {learningLoopInsights.map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg border-l-4 border-2 border-border bg-background p-3 ${
                    item.type === "success"
                      ? "border-l-green-500"
                      : "border-l-amber-500"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {item.type === "success" ? (
                      <CheckCircle size={16} weight="fill" className="mt-0.5 text-green-600 flex-shrink-0" />
                    ) : (
                      <WarningCircle size={16} weight="fill" className="mt-0.5 text-amber-600 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-foreground">
                        {item.insight}
                      </p>
                      <p className="mt-1 text-xs text-foreground/60">
                        Impact: {item.impact}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Content Performance Heatmap-Style Table */}
        <div className="mb-8">
          <Card className="border-2 border-border bg-secondary-background p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <Fire size={22} weight="duotone" />
              Engagement Prediction vs Actual
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Content
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-foreground">
                      Actual Engagement
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-foreground">
                      Predicted
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-foreground">
                      Sentiment
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-foreground">
                      Accuracy
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contentPerformance.map((item, idx) => {
                    const accuracy = Math.round(
                      (item.engagement / item.predicted) * 100
                    );
                    return (
                      <tr key={idx} className="border-b border-border hover:bg-background">
                        <td className="px-4 py-3 font-medium text-foreground">
                          {item.title}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-600 font-semibold">
                            {item.engagement}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="rounded-full bg-purple-500/10 px-3 py-1 text-purple-600 font-semibold">
                            {item.predicted}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className="rounded-full px-3 py-1 font-semibold"
                            style={{
                              backgroundColor: `rgba(16, 185, 129, ${
                                item.sentiment / 100
                              })`,
                              color: "#10b981",
                            }}
                          >
                            {item.sentiment}/100
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`rounded-full px-3 py-1 font-semibold ${
                              accuracy >= 90
                                ? "bg-green-500/10 text-green-600"
                                : accuracy >= 80
                                  ? "bg-amber-500/10 text-amber-600"
                                  : "bg-red-500/10 text-red-600"
                            }`}
                          >
                            {accuracy}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Performance Heatmap */}
        <div className="mb-8">
          <Card className="border-2 border-border bg-secondary-background p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <Thermometer size={22} weight="duotone" />
              Performance Heatmap (Day × Hour)
            </h2>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="border border-border bg-background px-3 py-2 text-foreground font-semibold">
                        Day
                      </th>
                      {["6AM", "9AM", "12PM", "3PM", "6PM", "9PM"].map((hour) => (
                        <th
                          key={hour}
                          className="border border-border bg-background px-3 py-2 text-foreground font-semibold"
                        >
                          {hour}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                      const values = [92, 78, 88, 94, 87, 65];
                      return (
                        <tr key={day}>
                          <td className="border border-border bg-background px-3 py-2 font-semibold text-foreground">
                            {day}
                          </td>
                          {values.map((val, idx) => {
                            const intensity = val / 100;
                            return (
                              <td
                                key={`${day}-${idx}`}
                                className="border border-border px-3 py-2 text-center font-semibold text-white"
                                style={{
                                  backgroundColor: `rgba(59, 130, 246, ${intensity})`,
                                }}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-4 text-xs text-foreground/60">
              Blue intensity indicates engagement level. Darker = higher engagement.
            </p>
          </Card>
        </div>

        {/* Recommendations */}
        <div className="mb-8">
          <Card className="border-2 border-border bg-gradient-to-r from-main/10 via-secondary-background to-secondary-background p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <Lightbulb size={22} weight="duotone" />
              AI-Generated Recommendations
            </h2>
            <div className="space-y-2">
              <p className="flex items-start gap-2 text-sm text-foreground">
                <Check size={16} weight="bold" className="mt-0.5 shrink-0 text-green-600" />
                <span><span className="font-semibold">Schedule videos for 3 PM</span> — Peak
                engagement window with 92% average performance.</span>
              </p>
              <p className="flex items-start gap-2 text-sm text-foreground">
                <Check size={16} weight="bold" className="mt-0.5 shrink-0 text-green-600" />
                <span><span className="font-semibold">Focus on case studies</span> — Highest
                ROI ($1,200) and sentiment (91/100) among all formats.</span>
              </p>
              <p className="flex items-start gap-2 text-sm text-foreground">
                <Check size={16} weight="bold" className="mt-0.5 shrink-0 text-green-600" />
                <span><span className="font-semibold">Improve Monday content</span> — Posts
                underperform by 15%. Consider stronger narratives or formal tone.</span>
              </p>
              <p className="flex items-start gap-2 text-sm text-foreground">
                <Check size={16} weight="bold" className="mt-0.5 shrink-0 text-green-600" />
                <span><span className="font-semibold">Maintain narrative consistency</span> —
                Consistent posts show 25% better sentiment, feeding back into your next
                enhancement cycle.</span>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
