
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
    const { error } = await supabase.functions.invoke('record_pricing_click', {
      body: {
        session_id: data.session_id,
        tier: data.tier,
        timestamp: data.timestamp,
        location: data.location,
        browser: data.browser,
        referrer: data.referrer
      }
    });

    return error;
  } catch (error) {
    console.error("Error in recordPricingClick service:", error);
    return error as Error;
  }
};
