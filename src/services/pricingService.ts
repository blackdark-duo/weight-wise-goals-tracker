
import { supabase } from "@/integrations/supabase/client";

interface PricingClickData {
  session_id: string;
  tier: string;
  timestamp: string;
  location: string;
  browser: string;
  referrer: string;
}

// Define the function return type for clarity
interface RecordPricingClickResult {
  error: Error | null;
}

export const recordPricingClick = async (data: PricingClickData): Promise<Error | null> => {
  try {
    // Store click data in Supabase using a direct RPC call
    // We explicitly type the parameters as Record<string, any> to resolve the type error
    const { error } = await supabase.rpc('record_pricing_click', {
      p_session_id: data.session_id,
      p_tier: data.tier,
      p_timestamp: data.timestamp,
      p_location: data.location,
      p_browser: data.browser,
      p_referrer: data.referrer
    } as Record<string, any>);

    return error;
  } catch (error) {
    console.error("Error in recordPricingClick service:", error);
    return error as Error;
  }
};
