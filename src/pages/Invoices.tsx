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
import { Plus, Receipt, MoreHorizontal, Download, Send, Eye, Edit, CreditCard, Link } from "lucide-react";
import { InvoiceForm } from "@/components/forms/InvoiceForm";
import { toast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  invoiceId: string;
  customer: string;
  amount: number;
  status: "paid" | "unpaid" | "overdue";
  dueDate: string;
  frequency: string;
  paymentMethod: string;
  createdDate: string;
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceId: "INV-2024-001",
    customer: "John Doe - Acme Corp",
    amount: 15500,
    status: "paid",
    dueDate: "2024-02-15",
    frequency: "monthly",
    paymentMethod: "stripe",
    createdDate: "2024-01-15",
  },
  {
    id: "2",
    invoiceId: "INV-2024-002",
    customer: "Jane Smith - TechCorp",
    amount: 28750,
    status: "unpaid",
    dueDate: "2024-02-20",
    frequency: "one-time",
    paymentMethod: "razorpay",
    createdDate: "2024-01-20",
  },
  {
    id: "3",
    invoiceId: "INV-2024-003",
    customer: "Bob Johnson - StartupCo",
    amount: 12300,
    status: "overdue",
    dueDate: "2024-01-25",
    frequency: "quarterly",
    paymentMethod: "bank-transfer",
    createdDate: "2024-01-10",
  },
];

export default function Invoices() {
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: "bg-success/20 text-success border-success/30",
      unpaid: "bg-warning/20 text-warning border-warning/30",
      overdue: "bg-destructive/20 text-destructive border-destructive/30",
    };
    
    return (
      <Badge variant="outline" className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleMarkAsPaid = (invoice: Invoice) => {
    setInvoices(prev => 
      prev.map(inv => 
        inv.id === invoice.id ? { ...inv, status: "paid" as const } : inv
      )
    );
    toast({
      title: "Invoice Marked as Paid",
      description: `${invoice.invoiceId} has been marked as paid.`,
    });
  };

  const handleSendPaymentLink = (invoice: Invoice) => {
    toast({
      title: "Payment Link Sent",
      description: `Payment link for ${invoice.invoiceId} has been sent to the customer.`,
    });
  };

  const handleDownload = (invoice: Invoice) => {
    toast({
      title: "Downloading Invoice",
      description: `${invoice.invoiceId} PDF is being prepared.`,
    });
  };

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
        <Button className="btn-glow" onClick={() => setShowInvoiceForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <Card className="glass-card">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-success flex items-center justify-center">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Invoice List</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{invoice.invoiceId}</TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell className="capitalize">{invoice.frequency.replace("-", " ")}</TableCell>
                  <TableCell className="capitalize">{invoice.paymentMethod.replace("-", " ")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload(invoice)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowInvoiceForm(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(invoice)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendPaymentLink(invoice)}>
                          <Link className="h-4 w-4 mr-2" />
                          Send Pay Now Link
                        </DropdownMenuItem>
                        {invoice.status !== "paid" && (
                          <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice)}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Mark as Paid
                          </DropdownMenuItem>
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

      <InvoiceForm
        open={showInvoiceForm}
        onOpenChange={setShowInvoiceForm}
      />
    </div>
  );
}