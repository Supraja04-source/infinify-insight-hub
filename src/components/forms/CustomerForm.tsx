import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Building, Mail, Phone, MapPin, FileText, CreditCard } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone number is required"),
  company: z.string().min(1, "Company name is required"),
  industry: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  location: z.string().min(1, "Location is required"),
  address: z.string().min(1, "Address is required"),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: CustomerFormData & { id: string };
  onSuccess?: () => void;
}

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Construction",
  "Consulting",
  "Marketing",
  "Software",
  "Other"
];

const countries = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Singapore",
  "UAE",
  "Other"
];

export function CustomerForm({ open, onOpenChange, customer, onSuccess }: CustomerFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer || {
      name: "",
      email: "",
      phone: "",
      company: "",
      industry: "",
      country: "India",
      location: "",
      address: "",
      gstin: "",
      pan: "",
      status: "active",
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    setLoading(true);
    try {
      if (customer) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', customer.id);

        if (error) throw error;

        toast({
          title: "Customer updated",
          description: "Customer information has been updated successfully.",
        });
      } else {
        // Create new customer
        const { error } = await supabase
          .from('customers')
          .insert(data);

        if (error) throw error;

        toast({
          title: "Customer created",
          description: "New customer has been added successfully.",
        });
      }
      
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error saving customer:', error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto glass-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {customer ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>
          <DialogDescription>
            {customer ? "Update customer information" : "Fill in the details to add a new customer"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Company
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@acme.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="+1-234-567-8900" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    City/Location
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="New York" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="123 Business Street, Suite 100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gstin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      GSTIN
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="22AAAAA0000A1Z5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      PAN
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="AAAAA9999A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="btn-glow">
                {loading ? "Saving..." : customer ? "Update Customer" : "Add Customer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}