import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Download,
  PieChart,
  Target,
  Users,
  DollarSign,
  Calendar,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

const salesData = [
  { month: "Jan", sales: 45000, target: 50000 },
  { month: "Feb", sales: 52000, target: 50000 },
  { month: "Mar", sales: 48000, target: 55000 },
  { month: "Apr", sales: 61000, target: 60000 },
  { month: "May", sales: 55000, target: 58000 },
  { month: "Jun", sales: 67000, target: 65000 },
];

const conversionData = [
  { name: "Quotes Sent", value: 120, color: "#8b5cf6" },
  { name: "Accepted", value: 45, color: "#10b981" },
  { name: "Rejected", value: 25, color: "#ef4444" },
  { name: "Pending", value: 50, color: "#f59e0b" },
];

const revenueData = [
  { month: "Jan", revenue: 45000, profit: 15000 },
  { month: "Feb", revenue: 52000, profit: 18000 },
  { month: "Mar", revenue: 48000, profit: 16000 },
  { month: "Apr", revenue: 61000, profit: 22000 },
  { month: "May", revenue: 55000, profit: 19000 },
  { month: "Jun", revenue: 67000, profit: 25000 },
];

const topCustomers = [
  { name: "Acme Corp", revenue: 125000, deals: 12 },
  { name: "TechCorp", revenue: 98000, deals: 8 },
  { name: "StartupCo", revenue: 76000, deals: 15 },
  { name: "Enterprise Ltd", revenue: 154000, deals: 6 },
  { name: "Innovation Inc", revenue: 87000, deals: 9 },
];

export default function Analytics() {
  const [dateRange, setDateRange] = useState("last-30-days");
  const [customerFilter, setCustomerFilter] = useState("");

  const handleExportReports = () => {
    console.log("Exporting reports...");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into your business performance
          </p>
        </div>
        <Button className="btn-glow" onClick={handleExportReports}>
          <Download className="h-4 w-4 mr-2" />
          Export Reports
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-7-days">Last 7 days</SelectItem>
              <SelectItem value="last-30-days">Last 30 days</SelectItem>
              <SelectItem value="last-90-days">Last 90 days</SelectItem>
              <SelectItem value="last-year">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Filter by customer..."
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="w-[200px]"
          />
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">$328,000</p>
              <p className="text-xs text-green-500">+12.5% from last month</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold">37.5%</p>
              <p className="text-xs text-green-500">+2.1% from last month</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-success flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-xs text-green-500">+8.2% from last month</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-warning to-primary flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Deal Size</p>
              <p className="text-2xl font-bold">$15,840</p>
              <p className="text-xs text-red-500">-3.2% from last month</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-destructive to-warning flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales vs Target */}
        <Card className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Sales vs Target</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Quotation Conversion Rate */}
        <Card className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-success flex items-center justify-center">
              <PieChart className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Quotation Conversion</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={conversionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {conversionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-4">
            {conversionData.map((item, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <div
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}: {item.value}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Revenue Trends */}
        <Card className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-success to-accent flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Revenue Trends</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                stackId="1"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="profit"
                stackId="2"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Customers */}
        <Card className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-warning to-primary flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Top Customers</h3>
          </div>
          <div className="space-y-4">
            {topCustomers.map((customer, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">{customer.deals} deals</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${customer.revenue.toLocaleString()}</p>
                  <Badge variant="outline" className="text-xs">
                    Rank #{index + 1}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}