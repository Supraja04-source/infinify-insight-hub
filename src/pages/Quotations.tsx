import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, FileText, MoreHorizontal, Download, Send, Eye, Edit, Check, X } from "lucide-react";
import { QuotationForm } from "@/components/forms/QuotationForm";
import { toast } from "@/hooks/use-toast";

interface Quotation {
  id: string;
  quotationId: string;
  customer: string;
  amount: number;
  status: "draft" | "sent" | "accepted" | "rejected";
  validityDate: string;
  createdDate: string;
}

const mockQuotations: Quotation[] = [
  {
    id: "1",
    quotationId: "Q-2024-001",
    customer: "John Doe - Acme Corp",
    amount: 15500,
    status: "sent",
    validityDate: "2024-02-15",
    createdDate: "2024-01-15",
  },
  {
    id: "2",
    quotationId: "Q-2024-002",
    customer: "Jane Smith - TechCorp",
    amount: 28750,
    status: "accepted",
    validityDate: "2024-02-20",
    createdDate: "2024-01-20",
  },
  {
    id: "3",
    quotationId: "Q-2024-003",
    customer: "Bob Johnson - StartupCo",
    amount: 12300,
    status: "draft",
    validityDate: "2024-02-25",
    createdDate: "2024-01-25",
  },
];

export default function Quotations() {
  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations);

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "bg-muted text-muted-foreground border-muted-foreground/30",
      sent: "bg-warning/20 text-warning border-warning/30",
      accepted: "bg-success/20 text-success border-success/30",
      rejected: "bg-destructive/20 text-destructive border-destructive/30",
    };
    
    return (
      <Badge variant="outline" className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleDownload = (quotation: Quotation) => {
    toast({
      title: "Downloading Quotation",
      description: `${quotation.quotationId} PDF is being prepared.`,
    });
  };

  const handleSend = (quotation: Quotation) => {
    toast({
      title: "Quotation Sent",
      description: `${quotation.quotationId} has been sent to the customer.`,
    });
  };

  const handleAccept = (quotation: Quotation) => {
    setQuotations(prev => 
      prev.map(q => 
        q.id === quotation.id ? { ...q, status: "accepted" as const } : q
      )
    );
    toast({
      title: "Quotation Accepted",
      description: `${quotation.quotationId} has been marked as accepted.`,
    });
  };

  const handleReject = (quotation: Quotation) => {
    setQuotations(prev => 
      prev.map(q => 
        q.id === quotation.id ? { ...q, status: "rejected" as const } : q
      )
    );
    toast({
      title: "Quotation Rejected",
      description: `${quotation.quotationId} has been marked as rejected.`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Quotation Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create, manage and track all your quotations
          </p>
        </div>
        <Button className="btn-glow" onClick={() => setShowQuotationForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Quotation
        </Button>
      </div>

      <Card className="glass-card">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Quotation List</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quotation ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Validity Date</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.map((quotation) => (
                <TableRow key={quotation.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{quotation.quotationId}</TableCell>
                  <TableCell>{quotation.customer}</TableCell>
                  <TableCell>${quotation.amount.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(quotation.status)}</TableCell>
                  <TableCell>{new Date(quotation.validityDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(quotation.createdDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload(quotation)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowQuotationForm(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(quotation)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSend(quotation)}>
                          <Send className="h-4 w-4 mr-2" />
                          Send via Email
                        </DropdownMenuItem>
                        {quotation.status === "sent" && (
                          <>
                            <DropdownMenuItem onClick={() => handleAccept(quotation)}>
                              <Check className="h-4 w-4 mr-2" />
                              Mark as Accepted
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReject(quotation)}>
                              <X className="h-4 w-4 mr-2" />
                              Mark as Rejected
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <QuotationForm
        open={showQuotationForm}
        onOpenChange={setShowQuotationForm}
      />
    </div>
  );
}