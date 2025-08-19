import { Plus, UserPlus, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function QuickActions() {
  const actions = [
    {
      title: "Create Quotation",
      description: "Generate new quotation",
      icon: FileText,
      action: () => console.log("Create quotation"),
      color: "from-primary to-secondary"
    },
    {
      title: "Add Customer",
      description: "Register new customer",
      icon: UserPlus,
      action: () => console.log("Add customer"),
      color: "from-accent to-success"
    },
    {
      title: "Schedule Follow-up",
      description: "Set reminder for customer",
      icon: Calendar,
      action: () => console.log("Schedule follow-up"),
      color: "from-warning to-destructive"
    }
  ];

  return (
    <Card className="glass-card p-6 space-y-4">
      <h3 className="text-lg font-semibold">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className="w-full justify-start h-auto p-4 hover:bg-muted/50 transition-all duration-300 group"
            onClick={action.action}
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300`}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium">{action.title}</p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
}