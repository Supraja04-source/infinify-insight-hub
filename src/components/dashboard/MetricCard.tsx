import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  trend?: number[];
}

export function MetricCard({ title, value, change, changeType, icon: Icon, trend }: MetricCardProps) {
  const changeColor = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground"
  }[changeType];

  return (
    <Card className="metric-card group">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{value}</p>
            <p className={`text-sm ${changeColor} flex items-center gap-1`}>
              {change}
            </p>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-end space-x-1 h-8">
          {trend.map((value, index) => (
            <div
              key={index}
              className="bg-gradient-to-t from-primary/20 to-primary/40 rounded-sm flex-1"
              style={{ height: `${(value / Math.max(...trend)) * 100}%` }}
            />
          ))}
        </div>
      )}
    </Card>
  );
}