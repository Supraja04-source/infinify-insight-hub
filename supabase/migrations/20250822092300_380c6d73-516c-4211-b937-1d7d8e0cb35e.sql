-- Fix the update_quotation_totals function
DROP FUNCTION IF EXISTS public.update_quotation_totals() CASCADE;

CREATE OR REPLACE FUNCTION public.update_quotation_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  target_quotation_id UUID;
BEGIN
  -- Get the quotation ID from the appropriate record
  IF TG_OP = 'DELETE' THEN
    target_quotation_id := OLD.quotation_id;
  ELSE
    target_quotation_id := NEW.quotation_id;
  END IF;

  -- Update the quotation totals
  UPDATE public.quotations 
  SET 
    subtotal = COALESCE((
      SELECT SUM(quantity * unit_price) 
      FROM public.quotation_items 
      WHERE quotation_id = target_quotation_id
    ), 0),
    gst_amount = COALESCE((
      SELECT SUM(quantity * unit_price * gst_percentage / 100) 
      FROM public.quotation_items 
      WHERE quotation_id = target_quotation_id
    ), 0),
    total_amount = COALESCE((
      SELECT SUM(line_total) 
      FROM public.quotation_items 
      WHERE quotation_id = target_quotation_id
    ), 0),
    updated_at = now()
  WHERE id = target_quotation_id;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER update_quotation_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.quotation_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_quotation_totals();