import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Headphones } from "lucide-react";

export default function Support() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Customer Support
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage customer support tickets and communications
          </p>
        </div>
        <Button className="btn-glow">
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      <Card className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-destructive to-warning flex items-center justify-center">
            <Headphones className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold">Support Dashboard</h3>
        </div>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Customer support interface coming soon...
        </div>
      </Card>
    </div>
  );
}