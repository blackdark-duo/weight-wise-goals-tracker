import { supabase } from "@/integrations/supabase/client";
import { validateWebhookUrl } from "@/utils/inputValidation";

/**
 * Centralized webhook service that ensures all webhook calls use the same URL source
 */
export class CentralizedWebhookService {
  private static instance: CentralizedWebhookService;
  private cachedConfig: { url: string; timestamp: number } | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): CentralizedWebhookService {
    if (!this.instance) {
      this.instance = new CentralizedWebhookService();
    }
    return this.instance;
  }

  /**
   * Get the current webhook URL from the database
   * Uses caching to avoid frequent database calls
   */
  async getWebhookUrl(): Promise<string> {
    // Check if we have a valid cached URL
    if (this.cachedConfig && 
        Date.now() - this.cachedConfig.timestamp < this.CACHE_DURATION) {
      return this.cachedConfig.url;
    }

    try {
      // Fetch from webhook_config table (primary source)
      const { data: config, error } = await supabase
        .from('webhook_config')
        .select('url')
        .eq('id', 1)
        .single();

      if (error) {
        console.error("Error fetching webhook config:", error);
        throw new Error("Failed to fetch webhook configuration");
      }

      if (!config?.url) {
        throw new Error("No webhook URL found in configuration");
      }

      // Cache the result
      this.cachedConfig = {
        url: config.url,
        timestamp: Date.now()
      };

      return config.url;
    } catch (error) {
      console.error("Error in getWebhookUrl:", error);
      // Fallback to a default URL if everything fails
      const fallbackUrl = 'https://n8n.cozyapp.uno/webhook/2c26d7e3-525a-4080-9282-21b6af883cf2';
      console.warn(`Using fallback webhook URL: ${fallbackUrl}`);
      return fallbackUrl;
    }
  }

  /**
   * Get webhook URL for a specific user
   * Falls back to global webhook URL if user doesn't have a custom one
   */
  async getUserWebhookUrl(userId: string): Promise<string> {
    try {
      // First try to get user-specific webhook URL
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('webhook_url')
        .eq('id', userId)
        .single();

      // If user has a custom webhook URL, use it
      if (!profileError && profile?.webhook_url) {
        return profile.webhook_url;
      }

      // Otherwise, fall back to global webhook URL
      return await this.getWebhookUrl();
    } catch (error) {
      console.error("Error fetching user webhook URL:", error);
      // Fall back to global webhook URL
      return await this.getWebhookUrl();
    }
  }

  /**
   * Update the global webhook URL
   */
  async updateWebhookUrl(url: string): Promise<boolean> {
    try {
      // Validate URL before updating
      const validation = validateWebhookUrl(url);
      if (!validation.isValid) {
        console.error("Invalid webhook URL:", validation.error);
        throw new Error(validation.error);
      }

      const { error } = await supabase
        .from('webhook_config')
        .update({ url })
        .eq('id', 1);

      if (error) {
        console.error("Error updating webhook URL:", error);
        return false;
      }

      // Clear cache to force refresh on next call
      this.cachedConfig = null;
      return true;
    } catch (error) {
      console.error("Error in updateWebhookUrl:", error);
      return false;
    }
  }

  /**
   * Update webhook URL for a specific user
   */
  async updateUserWebhookUrl(userId: string, url: string): Promise<boolean> {
    try {
      // Validate URL before updating
      const validation = validateWebhookUrl(url);
      if (!validation.isValid) {
        console.error("Invalid webhook URL:", validation.error);
        throw new Error(validation.error);
      }

      const { error } = await supabase
        .from('profiles')
        .update({ webhook_url: url })
        .eq('id', userId);

      if (error) {
        console.error("Error updating user webhook URL:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in updateUserWebhookUrl:", error);
      return false;
    }
  }

  /**
   * Clear the cached configuration
   * Useful when you know the configuration has changed
   */
  clearCache(): void {
    this.cachedConfig = null;
  }

  /**
   * Test a webhook URL by sending a test payload
   */
  async testWebhook(url: string, payload: any): Promise<any> {
    try {
      // Validate URL before testing
      const validation = validateWebhookUrl(url);
      if (!validation.isValid) {
        throw new Error(`Invalid webhook URL: ${validation.error}`);
      }

      // Check rate limits for webhook testing
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: rateLimitOk } = await supabase.rpc('check_webhook_rate_limit', {
          p_user_id: user.id,
          p_operation: 'test_webhook',
          p_max_requests: 5, // 5 tests per hour
          p_window_minutes: 60
        });

        if (!rateLimitOk) {
          throw new Error('Too many webhook tests. Please wait before testing again.');
        }

        // Record the test request
        await supabase.rpc('record_webhook_request', {
          p_user_id: user.id,
          p_operation: 'test_webhook'
        });
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000) // 10 seconds
      });

      if (!response.ok) {
        throw new Error(`Webhook test failed with status: ${response.status}`);
      }

      // Try to parse as JSON, but fall back to text if needed
      try {
        return await response.json();
      } catch (e) {
        return await response.text();
      }
    } catch (error: any) {
      console.error("Error testing webhook:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const webhookService = CentralizedWebhookService.getInstance();
