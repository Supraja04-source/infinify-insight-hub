import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Download } from "lucide-react";

export default function Analytics() {
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
        <Button className="btn-glow">
          <Download className="h-4 w-4 mr-2" />
          Export Reports
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Sales vs Target</h3>
          </div>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart implementation coming soon...
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-success flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Revenue Trends</h3>
          </div>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart implementation coming soon...
          </div>
        </Card>
      </div>
    </div>
  );
}