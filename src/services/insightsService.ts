
import { supabase } from "@/integrations/supabase/client";
import { formatInsightsResponse } from "@/utils/insightsFormatter";

export async function fetchInsightsData(userId: string) {
  try {
    const response = await fetch(
      'https://mjzzdynuzrpklgexabzs.supabase.co/functions/v1/send_ai_insights',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status}`);
    }

    const responseData = await response.json();
    
    if (!responseData.insights) {
      throw new Error("No insights were returned from the AI service");
    }

    return {
      formattedInsights: formatInsightsResponse(responseData.insights),
      rawResponse: responseData.response || responseData
    };
  } catch (error) {
    console.error("Error in fetchInsightsData:", error);
    throw error;
  }
}
