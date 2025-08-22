import { useState, useEffect } from "react";
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
import { Plus, Receipt, MoreHorizontal, Download, Send, Eye, Edit, CreditCard, Link, Zap, TrendingUp, Sparkles } from "lucide-react";
import { InvoiceForm } from "@/components/forms/InvoiceForm";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Invoice {
  id: string;
  invoice_id: string;
  customer_id: string;
  customer?: {
    name: string;
    company?: string;
  } | null;
  total_amount: number;
  status: "paid" | "unpaid" | "overdue";
  due_date: string;
  frequency: string;
  payment_method: string;
  created_at: string;
  quotation_id?: string;
}

export default function Invoices() {
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers!customer_id(name, company)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices((data as any) || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error Loading Invoices",
        description: "Failed to load invoices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleMarkAsPaid = async (invoice: Invoice) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoice.id);

      if (error) throw error;

      setInvoices(prev => 
        prev.map(inv => 
          inv.id === invoice.id ? { ...inv, status: "paid" as const } : inv
        )
      );
      
      toast({
        title: "Invoice Marked as Paid",
        description: `${invoice.invoice_id} has been marked as paid.`,
      });
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast({
        title: "Error",
        description: "Failed to update invoice status.",
        variant: "destructive",
      });
    }
  };

  const handleSendPaymentLink = (invoice: Invoice) => {
    toast({
      title: "Payment Link Sent",
      description: `Payment link for ${invoice.invoice_id} has been sent to the customer.`,
    });
  };

  const handleDownload = (invoice: Invoice) => {
    toast({
      title: "Downloading Invoice",
      description: `${invoice.invoice_id} PDF is being prepared.`,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Invoice Management
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered invoice generation with smart GST calculation
            </p>
          </div>
        </div>
        <Card className="glass-card">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading invoices...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
            <Zap className="h-8 w-8" />
            Invoice Management
            <Badge variant="outline" className="ml-2 bg-gradient-to-r from-accent to-success text-white border-none">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            AI-powered invoice generation with smart GST calculation based on location
          </p>
        </div>
        <Button className="btn-glow" onClick={() => setShowInvoiceForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <Card className="glass-card border-primary/20">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-success flex items-center justify-center">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Invoice List</h3>
              <p className="text-sm text-muted-foreground">
                Smart invoices with automatic GST calculation
              </p>
            </div>
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
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="space-y-2">
                      <Receipt className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">No invoices found</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowInvoiceForm(true)}
                        className="btn-glow-sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Invoice
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{invoice.invoice_id}</TableCell>
                    <TableCell>
                      {invoice.customer?.name}
                      {invoice.customer?.company && (
                        <span className="text-muted-foreground"> - {invoice.customer.company}</span>
                      )}
                    </TableCell>
                    <TableCell>₹{invoice.total_amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                    <TableCell className="capitalize">{invoice.frequency.replace("-", " ")}</TableCell>
                    <TableCell className="capitalize">{invoice.payment_method.replace("-", " ")}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card">
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
                ))
              )}
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