-- Fix security warnings by setting search_path for functions
DROP FUNCTION IF EXISTS generate_quotation_id();
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

DROP FUNCTION IF EXISTS set_quotation_id();
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

DROP FUNCTION IF EXISTS calculate_line_total();
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

DROP FUNCTION IF EXISTS update_quotation_totals();
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