import { Clock, User, FileText, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TimelineItem {
  id: string;
  type: "quotation" | "invoice" | "customer" | "payment";
  title: string;
  description: string;
  time: string;
  user: string;
}

const timelineData: TimelineItem[] = [
  {
    id: "1",
    type: "quotation",
    title: "New Quotation Created",
    description: "QUO-2024-001 for TechCorp Solutions",
    time: "2 minutes ago",
    user: "John Doe"
  },
  {
    id: "2",
    type: "payment",
    title: "Payment Received",
    description: "₹25,000 from ABC Industries",
    time: "15 minutes ago",
    user: "System"
  },
  {
    id: "3",
    type: "customer",
    title: "New Customer Added",
    description: "XYZ Technology Pvt Ltd",
    time: "1 hour ago",
    user: "Sarah Wilson"
  },
  {
    id: "4",
    type: "invoice",
    title: "Invoice Generated",
    description: "INV-2024-045 sent to customer",
    time: "2 hours ago",
    user: "Mike Johnson"
  }
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "quotation": return FileText;
    case "invoice": return FileText;
    case "customer": return User;
    case "payment": return DollarSign;
    default: return Clock;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "quotation": return "from-primary to-secondary";
    case "invoice": return "from-accent to-success";
    case "customer": return "from-warning to-primary";
    case "payment": return "from-success to-accent";
    default: return "from-muted to-muted-foreground";
  }
};

export function ActivityTimeline() {
  return (
    <Card className="glass-card p-6 space-y-4">
      <h3 className="text-lg font-semibold">Recent Activity</h3>
      <div className="space-y-4">
        {timelineData.map((item, index) => {
          const Icon = getTypeIcon(item.type);
          const colorClass = getTypeColor(item.type);
          
          return (
            <div key={item.id} className="flex items-start space-x-3 group">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                  <span className="text-xs text-muted-foreground">•</span>
                  <p className="text-xs text-muted-foreground">{item.user}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}