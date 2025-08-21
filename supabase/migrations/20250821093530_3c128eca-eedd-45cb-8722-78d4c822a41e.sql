-- Drop triggers first, then recreate functions with proper search_path
DROP TRIGGER IF EXISTS generate_quotation_id_trigger ON public.quotations;
DROP TRIGGER IF EXISTS calculate_line_total_trigger ON public.quotation_items;
DROP TRIGGER IF EXISTS update_quotation_totals_trigger ON public.quotation_items;

-- Drop and recreate functions with security definer and search_path
DROP FUNCTION IF EXISTS generate_quotation_id();
DROP FUNCTION IF EXISTS set_quotation_id();
DROP FUNCTION IF EXISTS calculate_line_total();
DROP FUNCTION IF EXISTS update_quotation_totals();

CREATE OR REPLACE FUNCTION generate_quotation_id()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 'QUO' || LPAD(nextval('quotation_id_seq')::TEXT, 7, '0');
END;
$$;

CREATE OR REPLACE FUNCTION set_quotation_id()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.quotation_id IS NULL OR NEW.quotation_id = '' THEN
    NEW.quotation_id := generate_quotation_id();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION calculate_line_total()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.line_total := NEW.quantity * NEW.unit_price * (1 + NEW.gst_percentage / 100);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_quotation_totals()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Recreate triggers
CREATE TRIGGER generate_quotation_id_trigger
  BEFORE INSERT ON public.quotations
  FOR EACH ROW
  EXECUTE FUNCTION set_quotation_id();

CREATE TRIGGER calculate_line_total_trigger
  BEFORE INSERT OR UPDATE ON public.quotation_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_line_total();

CREATE TRIGGER update_quotation_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.quotation_items
  FOR EACH ROW
  EXECUTE FUNCTION update_quotation_totals();