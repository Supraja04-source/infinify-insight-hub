-- Create customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  industry TEXT,
  country TEXT,
  location TEXT,
  address TEXT,
  gstin TEXT,
  pan TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  gst_percentage DECIMAL(5,2) NOT NULL DEFAULT 18,
  category TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create quotations table
CREATE TABLE public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) NOT NULL,
  quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  gst_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  terms TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create quotation_items table
CREATE TABLE public.quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id),
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  gst_percentage DECIMAL(5,2) NOT NULL DEFAULT 18,
  line_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customers
CREATE POLICY "Allow all operations on customers" ON public.customers FOR ALL USING (true);

-- Create RLS policies for products
CREATE POLICY "Allow all operations on products" ON public.products FOR ALL USING (true);

-- Create RLS policies for quotations
CREATE POLICY "Allow all operations on quotations" ON public.quotations FOR ALL USING (true);

-- Create RLS policies for quotation_items
CREATE POLICY "Allow all operations on quotation_items" ON public.quotation_items FOR ALL USING (true);

-- Create sequence for quotation ID auto-increment
CREATE SEQUENCE quotation_id_seq START 1;

-- Function to generate quotation ID
CREATE OR REPLACE FUNCTION generate_quotation_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'QUO' || LPAD(nextval('quotation_id_seq')::TEXT, 7, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate quotation ID
CREATE OR REPLACE FUNCTION set_quotation_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quotation_id IS NULL OR NEW.quotation_id = '' THEN
    NEW.quotation_id := generate_quotation_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_quotation_id_trigger
  BEFORE INSERT ON public.quotations
  FOR EACH ROW
  EXECUTE FUNCTION set_quotation_id();

-- Function to calculate line total
CREATE OR REPLACE FUNCTION calculate_line_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.line_total := NEW.quantity * NEW.unit_price * (1 + NEW.gst_percentage / 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_line_total_trigger
  BEFORE INSERT OR UPDATE ON public.quotation_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_line_total();

-- Function to update quotation totals
CREATE OR REPLACE FUNCTION update_quotation_totals()
RETURNS TRIGGER AS $$
DECLARE
  quotation_record RECORD;
BEGIN
  -- Get the quotation ID
  IF TG_OP = 'DELETE' THEN
    quotation_record.quotation_id := OLD.quotation_id;
  ELSE
    quotation_record.quotation_id := NEW.quotation_id;
  END IF;

  -- Update the quotation totals
  UPDATE public.quotations 
  SET 
    subtotal = COALESCE((
      SELECT SUM(quantity * unit_price) 
      FROM public.quotation_items 
      WHERE quotation_id = quotation_record.quotation_id
    ), 0),
    gst_amount = COALESCE((
      SELECT SUM(quantity * unit_price * gst_percentage / 100) 
      FROM public.quotation_items 
      WHERE quotation_id = quotation_record.quotation_id
    ), 0),
    total_amount = COALESCE((
      SELECT SUM(line_total) 
      FROM public.quotation_items 
      WHERE quotation_id = quotation_record.quotation_id
    ), 0),
    updated_at = now()
  WHERE id = quotation_record.quotation_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quotation_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.quotation_items
  FOR EACH ROW
  EXECUTE FUNCTION update_quotation_totals();

-- Insert sample data
INSERT INTO public.customers (name, email, phone, company, industry, country, location, address) VALUES
  ('John Doe', 'john@acmecorp.com', '+1-234-567-8900', 'Acme Corp', 'Technology', 'USA', 'New York', '123 Business St, NY 10001'),
  ('Jane Smith', 'jane@techcorp.com', '+1-234-567-8901', 'TechCorp', 'Software', 'USA', 'California', '456 Tech Ave, CA 90210'),
  ('Bob Johnson', 'bob@startupco.com', '+1-234-567-8902', 'StartupCo', 'Consulting', 'USA', 'Texas', '789 Startup Blvd, TX 75001');

INSERT INTO public.products (name, description, unit_price, gst_percentage, category) VALUES
  ('Website Development', 'Custom website development services', 5000.00, 18, 'Development'),
  ('Mobile App Development', 'iOS and Android app development', 8000.00, 18, 'Development'),
  ('SEO Services', 'Search engine optimization services', 1500.00, 18, 'Marketing'),
  ('Consulting Hours', 'Business consulting services', 150.00, 18, 'Consulting'),
  ('Graphic Design', 'Logo and brand design services', 800.00, 18, 'Design'),
  ('Digital Marketing', 'Social media and online marketing', 2500.00, 18, 'Marketing');