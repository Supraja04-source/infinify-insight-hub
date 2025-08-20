import { useState } from "react";
import { Download, RefreshCw, Filter, TrendingUp, DollarSign, FileText, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("This Week");
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for metrics - matching the screenshot values
  const metrics = [
    {
      title: "Total Leads",
      value: "0",
      change: "+0% from last month",
      changeType: "neutral" as const,
      icon: Users,
      trend: [0, 0, 0, 0, 0, 0, 0]
    },
    {
      title: "Deals Closed",
      value: "0",
      change: "+0% from last month", 
      changeType: "neutral" as const,
      icon: TrendingUp,
      trend: [0, 0, 0, 0, 0, 0, 0]
    },
    {
      title: "Revenue",
      value: "₹0",
      change: "+0% from last month",
      changeType: "neutral" as const,
      icon: DollarSign,
      trend: [0, 0, 0, 0, 0, 0, 0]
    },
    {
      title: "Pending Invoices",
      value: "0",
      change: "+0% from last month",
      changeType: "neutral" as const,
      icon: FileText,
      trend: [0, 0, 0, 0, 0, 0, 0]
    },
    {
      title: "Upcoming Follow-ups",
      value: "1",
      change: "+100% from last month",
      changeType: "positive" as const,
      icon: Calendar,
      trend: [0, 0, 0, 0, 0, 0, 1]
    }
  ];

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    console.log("Exporting dashboard as PDF...");
  };

  const handleRefresh = () => {
    // TODO: Implement data refresh
    console.log("Refreshing dashboard data...");
  };

  const handleGetStarted = () => {
    // TODO: Implement get started flow
    console.log("Starting onboarding flow...");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Welcome to SLATE CRM</h1>
          <p className="text-blue-100 text-lg mb-8">Your intelligent sales companion for the future</p>
          
          <div className="flex gap-4">
            <Button 
              onClick={handleGetStarted}
              className="bg-black/20 hover:bg-black/30 text-white border-0 backdrop-blur-sm px-6 py-3"
            >
              Get Started
            </Button>
            <Button 
              onClick={handleExportPDF}
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm px-6 py-3"
            >
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-white/20"></div>
          <div className="absolute bottom-10 left-10 w-20 h-20 rounded-full bg-white/15"></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-white/10"></div>
        </div>
      </div>

      {/* Dashboard Overview Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Today">Today</SelectItem>
                <SelectItem value="This Week">This Week</SelectItem>
                <SelectItem value="This Month">This Month</SelectItem>
                <SelectItem value="This Quarter">This Quarter</SelectItem>
                <SelectItem value="This Year">This Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {metrics.map((metric, index) => (
            <div key={metric.title} className="animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
              <MetricCard {...metric} />
            </div>
          ))}
        </div>
      </div>

      {/* Additional Filter Section - shown when filters button is clicked */}
      {showFilters && (
        <Card className="p-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Lead Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Deal Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="prospecting">Prospecting</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Sales Rep" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reps</SelectItem>
                <SelectItem value="john">John Doe</SelectItem>
                <SelectItem value="jane">Jane Smith</SelectItem>
                <SelectItem value="bob">Bob Johnson</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={() => setShowFilters(false)}>Apply Filters</Button>
          </div>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Activities</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium">New lead from website contact form</p>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium">Follow-up scheduled with TechCorp</p>
                <p className="text-sm text-muted-foreground">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium">Quotation QUO-2024-001 sent</p>
                <p className="text-sm text-muted-foreground">3 days ago</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <QuickActions />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityTimeline />
        
        {/* Sales Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Sales Performance</h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-muted-foreground">₹0</div>
              <p className="text-sm text-muted-foreground">Total Revenue This Month</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Target: ₹15,00,000</span>
                <span>0%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full" style={{ width: "0%" }}></div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Start adding customers and deals to see your progress!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}