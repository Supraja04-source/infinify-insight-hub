-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL,
  quotation_id UUID,
  due_date DATE NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'bank-transfer',
  frequency TEXT NOT NULL DEFAULT 'one-time',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  gst_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unpaid',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoice_items table
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  item_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  gst_percentage NUMERIC NOT NULL DEFAULT 18,
  line_total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on invoices" ON public.invoices FOR ALL USING (true);
CREATE POLICY "Allow all operations on invoice_items" ON public.invoice_items FOR ALL USING (true);

-- Create sequence for invoice IDs
CREATE SEQUENCE IF NOT EXISTS invoice_id_seq START 1;

-- Create function to generate invoice ID
CREATE OR REPLACE FUNCTION public.generate_invoice_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('invoice_id_seq')::TEXT, 4, '0');
END;
$function$;

-- Create trigger to auto-generate invoice ID
CREATE OR REPLACE FUNCTION public.set_invoice_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.invoice_id IS NULL OR NEW.invoice_id = '' THEN
    NEW.invoice_id := generate_invoice_id();
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER set_invoice_id_trigger
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.set_invoice_id();

-- Create function to calculate invoice line total
CREATE OR REPLACE FUNCTION public.calculate_invoice_line_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.line_total := NEW.quantity * NEW.unit_price * (1 + NEW.gst_percentage / 100);
  RETURN NEW;
END;
$function$;

CREATE TRIGGER calculate_invoice_line_total_trigger
  BEFORE INSERT OR UPDATE ON public.invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_invoice_line_total();

-- Create function to update invoice totals
CREATE OR REPLACE FUNCTION public.update_invoice_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  target_invoice_id UUID;
BEGIN
  -- Get the invoice ID from the appropriate record
  IF TG_OP = 'DELETE' THEN
    target_invoice_id := OLD.invoice_id;
  ELSE
    target_invoice_id := NEW.invoice_id;
  END IF;

  -- Update the invoice totals
  UPDATE public.invoices 
  SET 
    subtotal = COALESCE((
      SELECT SUM(quantity * unit_price) 
      FROM public.invoice_items 
      WHERE invoice_id = target_invoice_id
    ), 0),
    gst_amount = COALESCE((
      SELECT SUM(quantity * unit_price * gst_percentage / 100) 
      FROM public.invoice_items 
      WHERE invoice_id = target_invoice_id
    ), 0),
    total_amount = COALESCE((
      SELECT SUM(line_total) 
      FROM public.invoice_items 
      WHERE invoice_id = target_invoice_id
    ), 0),
    updated_at = now()
  WHERE id = target_invoice_id;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE TRIGGER update_invoice_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invoice_totals();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on invoices
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();