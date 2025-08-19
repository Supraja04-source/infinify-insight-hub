import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Receipt } from "lucide-react";

export default function Invoices() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Invoice Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate, track and manage customer invoices
          </p>
        </div>
        <Button className="btn-glow">
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <Card className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-success flex items-center justify-center">
            <Receipt className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold">Invoice List</h3>
        </div>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Invoice management interface coming soon...
        </div>
      </Card>
    </div>
  );
}