
-- Create a function to record pricing clicks
CREATE OR REPLACE FUNCTION public.record_pricing_click(
  p_session_id TEXT,
  p_tier TEXT,
  p_timestamp TIMESTAMPTZ,
  p_location TEXT,
  p_browser TEXT,
  p_referrer TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.pricing_clicks (
    session_id,
    tier,
    timestamp,
    location,
    browser,
    referrer
  ) VALUES (
    p_session_id,
    p_tier,
    p_timestamp,
    p_location,
    p_browser,
    p_referrer
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission to execute the function to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.record_pricing_click TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_pricing_click TO anon;
