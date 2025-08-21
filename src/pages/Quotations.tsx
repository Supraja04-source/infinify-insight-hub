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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, FileText, MoreHorizontal, Download, Send, Eye, Edit, Check, X, Trash2 } from "lucide-react";
import { QuotationForm } from "@/components/forms/QuotationForm";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Quotation {
  id: string;
  quotation_id: string;
  customer_id: string;
  quotation_date: string;
  valid_until: string;
  status: "draft" | "sent" | "accepted" | "rejected";
  subtotal: number;
  gst_amount: number;
  total_amount: number;
  notes?: string;
  terms?: string;
  customers: {
    name: string;
    company: string;
  };
  quotation_items: Array<{
    id: string;
    item_name: string;
    quantity: number;
    unit_price: number;
    gst_percentage: number;
    line_total: number;
  }>;
}

export default function Quotations() {
  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | undefined>();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; quotation?: Quotation }>({ open: false });

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          customers (name, company),
          quotation_items (*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setQuotations((data || []) as Quotation[]);
    } catch (error: any) {
      console.error('Error loading quotations:', error);
      toast({
        title: "Error",
        description: "Failed to load quotations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleEdit = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setShowQuotationForm(true);
  };

  const handleView = (quotation: Quotation) => {
    // Create a detailed view of quotation
    const details = `
Quotation ID: ${quotation.quotation_id}
Customer: ${quotation.customers.name} - ${quotation.customers.company}
Date: ${new Date(quotation.quotation_date).toLocaleDateString()}
Valid Until: ${new Date(quotation.valid_until).toLocaleDateString()}
Status: ${quotation.status.toUpperCase()}
Total: ₹${quotation.total_amount.toFixed(2)}

Items:
${quotation.quotation_items.map(item => 
  `• ${item.item_name} - Qty: ${item.quantity}, Price: ₹${item.unit_price}, GST: ${item.gst_percentage}%, Total: ₹${item.line_total.toFixed(2)}`
).join('\n')}

${quotation.notes ? `Notes: ${quotation.notes}` : ''}
${quotation.terms ? `Terms: ${quotation.terms}` : ''}
    `;

    toast({
      title: "Quotation Details",
      description: details,
    });
  };

  const handleDownloadPDF = (quotation: Quotation) => {
    // Generate PDF content
    const pdfContent = `
QUOTATION - ${quotation.quotation_id}

Customer: ${quotation.customers.name}
Company: ${quotation.customers.company}
Date: ${new Date(quotation.quotation_date).toLocaleDateString()}
Valid Until: ${new Date(quotation.valid_until).toLocaleDateString()}

ITEMS:
${quotation.quotation_items.map((item, index) => 
  `${index + 1}. ${item.item_name}
     Quantity: ${item.quantity}
     Unit Price: ₹${item.unit_price.toFixed(2)}
     GST: ${item.gst_percentage}%
     Line Total: ₹${item.line_total.toFixed(2)}`
).join('\n\n')}

SUMMARY:
Subtotal: ₹${quotation.subtotal.toFixed(2)}
GST Amount: ₹${quotation.gst_amount.toFixed(2)}
Grand Total: ₹${quotation.total_amount.toFixed(2)}

${quotation.notes ? `Notes: ${quotation.notes}` : ''}
${quotation.terms ? `Terms & Conditions: ${quotation.terms}` : ''}
    `;

    // Create and download the file
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quotation.quotation_id}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Download Started",
      description: `${quotation.quotation_id} has been downloaded.`,
    });
  };

  const handleSendEmail = (quotation: Quotation) => {
    // Simulate sending email
    const subject = `Quotation ${quotation.quotation_id} from SLATE CRM`;
    const body = `Dear ${quotation.customers.name},

Please find attached quotation ${quotation.quotation_id} for your review.

Total Amount: ₹${quotation.total_amount.toFixed(2)}
Valid Until: ${new Date(quotation.valid_until).toLocaleDateString()}

Best regards,
SLATE CRM Team`;

    // Open email client
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);

    toast({
      title: "Email Client Opened",
      description: `Email template for ${quotation.quotation_id} is ready to send.`,
    });
  };

  const handleStatusUpdate = async (quotation: Quotation, newStatus: "sent" | "accepted" | "rejected") => {
    try {
      const { error } = await supabase
        .from('quotations')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', quotation.id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `${quotation.quotation_id} has been marked as ${newStatus}.`,
      });

      loadQuotations();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update quotation status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (quotation: Quotation) => {
    try {
      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('id', quotation.id);

      if (error) throw error;

      toast({
        title: "Quotation Deleted",
        description: `${quotation.quotation_id} has been removed from the system.`,
      });

      loadQuotations();
      setDeleteDialog({ open: false });
    } catch (error: any) {
      console.error('Error deleting quotation:', error);
      toast({
        title: "Error",
        description: "Failed to delete quotation",
        variant: "destructive",
      });
    }
  };

  const handleAddNew = () => {
    setSelectedQuotation(undefined);
    setShowQuotationForm(true);
  };

  const handleFormSuccess = () => {
    loadQuotations();
  };

  const exportToCSV = () => {
    const csvContent = [
      ["Quotation ID", "Customer", "Company", "Date", "Valid Until", "Status", "Total Amount"].join(","),
      ...quotations.map(q => [
        q.quotation_id,
        q.customers.name,
        q.customers.company,
        q.quotation_date,
        q.valid_until,
        q.status,
        q.total_amount.toFixed(2)
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotations.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Export Complete",
      description: "Quotations have been exported to CSV.",
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button className="btn-glow" onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create Quotation
          </Button>
        </div>
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
          {loading ? (
            <div className="p-8 text-center">Loading quotations...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quotation ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No quotations found. Create your first quotation to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  quotations.map((quotation) => (
                    <TableRow key={quotation.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{quotation.quotation_id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{quotation.customers.name}</div>
                          <div className="text-sm text-muted-foreground">{quotation.customers.company}</div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(quotation.quotation_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(quotation.valid_until).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(quotation.status)}</TableCell>
                      <TableCell>₹{quotation.total_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(quotation)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(quotation)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadPDF(quotation)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendEmail(quotation)}>
                              <Send className="h-4 w-4 mr-2" />
                              Send via Email
                            </DropdownMenuItem>
                            {quotation.status === "draft" && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(quotation, "sent")}>
                                <Send className="h-4 w-4 mr-2" />
                                Mark as Sent
                              </DropdownMenuItem>
                            )}
                            {quotation.status === "sent" && (
                              <>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(quotation, "accepted")}>
                                  <Check className="h-4 w-4 mr-2" />
                                  Mark as Accepted
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(quotation, "rejected")}>
                                  <X className="h-4 w-4 mr-2" />
                                  Mark as Rejected
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem 
                              onClick={() => setDeleteDialog({ open: true, quotation })}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      <QuotationForm
        open={showQuotationForm}
        onOpenChange={setShowQuotationForm}
        quotation={selectedQuotation}
        onSuccess={handleFormSuccess}
      />

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quotation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete quotation {deleteDialog.quotation?.quotation_id}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteDialog.quotation && handleDelete(deleteDialog.quotation)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}