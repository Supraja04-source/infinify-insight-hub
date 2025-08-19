import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, FileText, Users, Calendar, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("week");

  const metrics = [
    {
      title: "Total Leads",
      value: "2,847",
      change: "+12.5% from last month",
      changeType: "positive" as const,
      icon: Users,
      trend: [45, 52, 48, 61, 55, 67, 72]
    },
    {
      title: "Deals Closed",
      value: "156",
      change: "+8.2% from last month",
      changeType: "positive" as const,
      icon: Target,
      trend: [12, 15, 13, 18, 16, 21, 24]
    },
    {
      title: "Revenue",
      value: "₹12,48,000",
      change: "+15.3% from last month",
      changeType: "positive" as const,
      icon: DollarSign,
      trend: [85, 92, 88, 96, 94, 102, 108]
    },
    {
      title: "Pending Invoices",
      value: "23",
      change: "-5.1% from last month",
      changeType: "negative" as const,
      icon: FileText,
      trend: [28, 26, 24, 25, 23, 22, 23]
    },
    {
      title: "Upcoming Follow-ups",
      value: "42",
      change: "+3.8% from last month",
      changeType: "positive" as const,
      icon: Calendar,
      trend: [35, 38, 36, 40, 39, 41, 42]
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your business overview.
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48 bg-card/50">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {metrics.map((metric, index) => (
          <div key={metric.title} className="animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
            <MetricCard {...metric} />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Quotations */}
        <Card className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Quotations</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-3">
            {[
              { id: "QUO-2024-001", customer: "TechCorp Solutions", amount: "₹2,50,000", status: "Pending", date: "2024-01-15" },
              { id: "QUO-2024-002", customer: "ABC Industries", amount: "₹1,75,000", status: "Accepted", date: "2024-01-14" },
              { id: "QUO-2024-003", customer: "XYZ Technology", amount: "₹3,20,000", status: "Sent", date: "2024-01-13" },
              { id: "QUO-2024-004", customer: "InnovateCorp", amount: "₹95,000", status: "Draft", date: "2024-01-12" }
            ].map((quote, index) => (
              <div key={quote.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                <div className="space-y-1">
                  <p className="font-medium">{quote.id}</p>
                  <p className="text-sm text-muted-foreground">{quote.customer}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-medium">{quote.amount}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    quote.status === 'Accepted' ? 'bg-success/20 text-success' :
                    quote.status === 'Pending' ? 'bg-warning/20 text-warning' :
                    quote.status === 'Sent' ? 'bg-primary/20 text-primary' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {quote.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <QuickActions />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityTimeline />
        
        {/* Sales Target */}
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Sales Target</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Target: ₹15,00,000</span>
              <span className="text-sm font-medium">₹12,48,000 achieved</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500" style={{ width: "83.2%" }}></div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">83.2% Complete</span>
              <span className="text-success flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                On track
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}