import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Minus, Calendar, User, FileText, ShoppingCart } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CustomerForm } from "./CustomerForm";

const lineItemSchema = z.object({
  id: z.string().optional(),
  product_id: z.string().optional(),
  item_name: z.string().min(1, "Item name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit_price: z.number().min(0, "Price must be non-negative"),
  gst_percentage: z.number().min(0).max(100, "GST must be between 0-100%"),
});

const quotationSchema = z.object({
  customer_id: z.string().min(1, "Please select a customer"),
  quotation_date: z.string().min(1, "Quotation date is required"),
  valid_until: z.string().min(1, "Valid until date is required"),
  status: z.enum(["draft", "sent", "accepted", "rejected"]),
  notes: z.string().optional(),
  terms: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
});

type QuotationFormData = z.infer<typeof quotationSchema>;

interface QuotationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation?: any;
  onSuccess?: () => void;
}

interface Customer {
  id: string;
  name: string;
  company: string;
}

interface Product {
  id: string;
  name: string;
  unit_price: number;
  gst_percentage: number;
}

export function QuotationForm({ open, onOpenChange, quotation, onSuccess }: QuotationFormProps) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getValidUntilDate = (quotationDate: string) => {
    const date = new Date(quotationDate);
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  const form = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      customer_id: "",
      quotation_date: getTodayDate(),
      valid_until: getValidUntilDate(getTodayDate()),
      status: "draft",
      notes: "",
      terms: "",
      lineItems: [{ item_name: "", quantity: 1, unit_price: 0, gst_percentage: 18 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  const lineItems = form.watch("lineItems");
  const quotationDate = form.watch("quotation_date");

  // Auto-update valid_until when quotation_date changes
  useEffect(() => {
    if (quotationDate) {
      form.setValue("valid_until", getValidUntilDate(quotationDate));
    }
  }, [quotationDate, form]);

  useEffect(() => {
    if (open) {
      loadCustomers();
      loadProducts();
      
      if (quotation) {
        // Pre-populate form for editing
        form.reset({
          customer_id: quotation.customer_id,
          quotation_date: quotation.quotation_date,
          valid_until: quotation.valid_until,
          status: quotation.status,
          notes: quotation.notes || "",
          terms: quotation.terms || "",
          lineItems: quotation.quotation_items || [{ item_name: "", quantity: 1, unit_price: 0, gst_percentage: 18 }],
        });
      } else {
        form.reset({
          customer_id: "",
          quotation_date: getTodayDate(),
          valid_until: getValidUntilDate(getTodayDate()),
          status: "draft",
          notes: "",
          terms: "",
          lineItems: [{ item_name: "", quantity: 1, unit_price: 0, gst_percentage: 18 }],
        });
      }
    }
  }, [open, quotation, form]);

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, company')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, unit_price, gst_percentage')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    }
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  };

  const calculateGST = () => {
    return lineItems.reduce((total, item) => {
      const itemTotal = item.quantity * item.unit_price;
      return total + (itemTotal * (item.gst_percentage / 100));
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateGST();
  };

  const onSubmit = async (data: QuotationFormData) => {
    setLoading(true);
    try {
      const quotationData = {
        customer_id: data.customer_id,
        quotation_date: data.quotation_date,
        valid_until: data.valid_until,
        status: data.status,
        notes: data.notes,
        terms: data.terms,
      };

      let quotationResult;
      
      if (quotation) {
        // Update existing quotation
        const { data: updateResult, error: quotationError } = await supabase
          .from('quotations')
          .update(quotationData)
          .eq('id', quotation.id)
          .select()
          .single();

        if (quotationError) throw quotationError;
        quotationResult = updateResult;

        // Delete existing items
        await supabase
          .from('quotation_items')
          .delete()
          .eq('quotation_id', quotation.id);
      } else {
        // Create new quotation (quotation_id will be auto-generated)
        const { data: createResult, error: quotationError } = await supabase
          .from('quotations')
          .insert({
            ...quotationData,
            quotation_id: '' // Will be auto-generated by trigger
          })
          .select()
          .single();

        if (quotationError) throw quotationError;
        quotationResult = createResult;
      }

      // Insert line items
      const lineItemsData = data.lineItems.map((item) => ({
        quotation_id: quotationResult.id,
        product_id: item.product_id || null,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        gst_percentage: item.gst_percentage,
      }));

      const { error: itemsError } = await supabase
        .from('quotation_items')
        .insert(lineItemsData);

      if (itemsError) throw itemsError;

      toast({
        title: quotation ? "Quotation updated" : "Quotation created",
        description: `Quotation ${quotationResult.quotation_id} has been ${quotation ? "updated" : "created"} successfully.`,
      });
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error saving quotation:', error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (productId: string, index: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      form.setValue(`lineItems.${index}.product_id`, product.id);
      form.setValue(`lineItems.${index}.item_name`, product.name);
      form.setValue(`lineItems.${index}.unit_price`, product.unit_price);
      form.setValue(`lineItems.${index}.gst_percentage`, product.gst_percentage);
    }
  };

  const handleCustomerAdded = () => {
    setShowCustomerForm(false);
    loadCustomers();
    toast({
      title: "Customer Added",
      description: "Customer has been added successfully. You can now select them from the dropdown.",
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto glass-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {quotation ? "Edit Quotation" : "Create New Quotation"}
            </DialogTitle>
            <DialogDescription>
              {quotation ? "Update quotation details" : "Fill in the details to create a new quotation"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Customer
                      </FormLabel>
                      <div className="flex gap-2">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name} - {customer.company}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCustomerForm(true)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quotation_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Quotation Date
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="valid_until"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Valid Until
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Line Items
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ item_name: "", quantity: 1, unit_price: 0, gst_percentage: 18 })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Item {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-4">
                        <FormLabel>Product/Service</FormLabel>
                        <Select onValueChange={(value) => handleProductSelect(value, index)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product or add custom" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - ₹{product.unit_price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <FormField
                        control={form.control}
                        name={`lineItems.${index}.item_name`}
                        render={({ field }) => (
                          <FormItem className="col-span-4">
                            <FormLabel>Item Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Custom item/service" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`lineItems.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="col-span-1">
                            <FormLabel>Qty</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`lineItems.${index}.unit_price`}
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Unit Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`lineItems.${index}.gst_percentage`}
                        render={({ field }) => (
                          <FormItem className="col-span-1">
                            <FormLabel>GST%</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="text-right">
                      <span className="text-sm text-muted-foreground">
                        Line Total: ₹{((lineItems[index]?.quantity || 0) * (lineItems[index]?.unit_price || 0) * (1 + (lineItems[index]?.gst_percentage || 0) / 100)).toFixed(2)}
                      </span>
                    </div>
                  </Card>
                ))}

                <Card className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST Amount:</span>
                      <span>₹{calculateGST().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Grand Total:</span>
                      <span>₹{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms & Conditions</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Terms and conditions..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="btn-glow">
                  {loading ? "Saving..." : quotation ? "Update Quotation" : "Create Quotation"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <CustomerForm
        open={showCustomerForm}
        onOpenChange={setShowCustomerForm}
        onSuccess={handleCustomerAdded}
      />
    </>
  );
}