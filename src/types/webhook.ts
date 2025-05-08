
export interface WebhookFields {
  user_data: boolean;
  weight_data: boolean;
  goal_data: boolean;
  activity_data: boolean;
  detailed_analysis: boolean;
}

export interface WebhookPayload {
  user_id: string;
  displayName: string;
  email: string;
  unit: string;
  entries: {
    weight: number[];
    notes: string[];
    dates: string[];
  };
  goal_weight?: number;
  goal_days?: number;
  [key: string]: any; // Add index signature to make it compatible with Json type
}

export interface WebhookLog {
  id: string;
  created_at: string;
  user_id: string;
  request_payload: any;
  response_payload: any;
  status: string;
  url: string;
  user_email?: string;
  user_display_name?: string;
}

export interface Profile {
  id: string;
  display_name?: string;
  email?: string;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
  webhook_limit?: number;
  webhook_count?: number;
  last_webhook_date?: string;
  webhook_url?: string;
  show_ai_insights?: boolean;
  preferred_unit?: string;
  timezone?: string;
  is_suspended?: boolean;
  scheduled_for_deletion?: boolean;
  deletion_date?: string | null;
}
