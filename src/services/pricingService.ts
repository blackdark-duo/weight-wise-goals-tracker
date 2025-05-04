
import { supabase } from "@/integrations/supabase/client";

interface PricingClickData {
  session_id: string;
  tier: string;
  timestamp: string;
  location: string;
  browser: string;
  referrer: string;
}

export const recordPricingClick = async (data: PricingClickData) => {
  try {
    // Store click data in Supabase using a direct RPC call
    const { error } = await supabase.rpc('record_pricing_click', {
      p_session_id: data.session_id,
      p_tier: data.tier,
      p_timestamp: data.timestamp,
      p_location: data.location,
      p_browser: data.browser,
      p_referrer: data.referrer
    });

    return error;
  } catch (error) {
    console.error("Error in recordPricingClick service:", error);
    return error;
  }
};
