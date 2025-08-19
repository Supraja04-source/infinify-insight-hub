import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { CustomerForm } from "@/components/forms/CustomerForm";
import { CustomerTable } from "@/components/tables/CustomerTable";
import { toast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  country: string;
  location: string;
  address: string;
  gstin?: string;
  pan?: string;
  status: "active" | "inactive";
  createdDate: string;
}

export default function Customers() {
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerForm(true);
  };

  const handleView = (customer: Customer) => {
    toast({
      title: "Customer Details",
      description: `Viewing details for ${customer.name}`,
    });
  };

  const handleDelete = (customer: Customer) => {
    toast({
      title: "Customer Deleted",
      description: `${customer.name} has been removed from the system.`,
      variant: "destructive",
    });
  };

  const handleAddNew = () => {
    setSelectedCustomer(undefined);
    setShowCustomerForm(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Customer Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage customer information and relationships
          </p>
        </div>
        <Button className="btn-glow" onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <CustomerTable 
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      <CustomerForm
        open={showCustomerForm}
        onOpenChange={setShowCustomerForm}
        customer={selectedCustomer}
      />
    </div>
  );
}