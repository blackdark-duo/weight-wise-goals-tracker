# Weight Wise Database Schema

## Overview
This document provides a comprehensive overview of the Supabase database schema for the Weight Wise application, including table structures, relationships, and usage patterns.

---

## Core Tables

### `profiles`
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | uuid | Primary key, references auth.users | NOT NULL, PK |
| `display_name` | text | User's display name | NULL |
| `email` | text | User's email address | NULL |
| `preferred_unit` | text | Weight unit preference (kg/lbs) | Default: 'kg' |
| `timezone` | text | User's timezone | Default: 'UTC' |
| `is_admin` | boolean | Admin role flag | Default: false |
| `credits` | integer | AI insights credits | Default: 5 |
| `show_ai_insights` | boolean | AI insights visibility preference | Default: true |
| `webhook_limit` | integer | Webhook usage limit | Default: 5 |
| `webhook_count` | integer | Current webhook usage | Default: 0 |
| `is_suspended` | boolean | Account suspension status | NULL |
| `scheduled_for_deletion` | boolean | Deletion schedule flag | Default: false |
| `deletion_date` | timestamp | Scheduled deletion date | NULL |
| `created_at` | timestamp | Record creation time | Default: now() |
| `updated_at` | timestamp | Last update time | Default: now() |

**Usage**: Central user profile management, referenced across all user-specific features.

### `weight_entries`
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | uuid | Primary key | NOT NULL, PK, Default: gen_random_uuid() |
| `user_id` | uuid | References user profile | NOT NULL |
| `weight` | numeric | Weight measurement | NOT NULL |
| `unit` | text | Measurement unit (kg/lbs) | NOT NULL |
| `date` | date | Entry date | NOT NULL, Default: CURRENT_DATE |
| `time` | time | Entry time | NOT NULL, Default: CURRENT_TIME |
| `description` | text | Optional notes | NULL |
| `created_at` | timestamp | Record creation time | Default: now() |

**Usage**: Core weight tracking data, displayed in dashboard charts and recent entries.

### `goals`
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | uuid | Primary key | NOT NULL, PK, Default: gen_random_uuid() |
| `user_id` | uuid | References user profile | NOT NULL |
| `target_weight` | numeric | Goal weight | NOT NULL |
| `start_weight` | numeric | Starting weight | NOT NULL |
| `target_date` | date | Goal target date | NULL |
| `unit` | text | Weight unit | NOT NULL |
| `achieved` | boolean | Goal completion status | Default: false |
| `created_at` | timestamp | Record creation time | Default: now() |
| `updated_at` | timestamp | Last update time | Default: now() |

**Usage**: Goal tracking and progress monitoring in Goals page.

---

## Configuration Tables

### `webhook_config`
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | integer | Configuration ID | NOT NULL, PK, Default: 1 |
| `url` | text | Webhook endpoint URL | NULL |
| `days` | integer | Data range in days | Default: 30 |
| `fields` | jsonb | Data fields configuration | Default: JSON object |
| `default_webhook_limit` | integer | Default user webhook limit | Default: 500 |
| `insights_limit` | integer | AI insights daily limit | Default: 10 |
| `insights_used` | integer | Current insights usage | Default: 0 |
| `insights_reset_date` | date | Usage reset date | Default: CURRENT_DATE |

**Usage**: System-wide webhook and AI insights configuration.

### `app_config`
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | bigint | Configuration ID | NOT NULL, PK |
| `key` | text | Configuration key | NOT NULL |
| `value` | text | Configuration value | NULL |
| `created_at` | timestamp | Record creation time | Default: now() |
| `updated_at` | timestamp | Last update time | Default: now() |

**Usage**: Application-wide configuration settings.

---

## Logging & Analytics Tables

### `webhook_logs`
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | uuid | Primary key | NOT NULL, PK, Default: gen_random_uuid() |
| `user_id` | uuid | References user profile | NOT NULL |
| `url` | text | Webhook endpoint | NOT NULL |
| `request_payload` | jsonb | Sent data | NOT NULL |
| `response_payload` | jsonb | Response data | NULL |
| `status` | text | Request status | NULL |
| `created_at` | timestamp | Log timestamp | Default: now() |

**Usage**: Webhook activity monitoring and debugging.

### `admin_logs`
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | uuid | Primary key | NOT NULL, PK, Default: gen_random_uuid() |
| `admin_id` | uuid | Admin user ID | NULL |
| `target_user_id` | uuid | Target user ID | NULL |
| `action` | text | Admin action performed | NOT NULL |
| `details` | jsonb | Action details | NULL |
| `ip_address` | text | Admin IP address | NULL |
| `created_at` | timestamp | Log timestamp | Default: now() |

**Usage**: Administrative action auditing and security monitoring.

### `api_requests`
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | uuid | Primary key | NOT NULL, PK, Default: gen_random_uuid() |
| `user_id` | uuid | References user profile | NULL |
| `endpoint` | text | API endpoint | NOT NULL |
| `ip_address` | text | Client IP address | NULL |
| `created_at` | timestamp | Request timestamp | Default: now() |

**Usage**: API usage tracking and rate limiting.

---

## Rate Limiting Tables

### `webhook_rate_limits`
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | uuid | Primary key | NOT NULL, PK, Default: gen_random_uuid() |
| `user_id` | uuid | References user profile | NOT NULL |
| `operation` | text | Operation type | NOT NULL |
| `request_count` | integer | Current request count | Default: 1 |
| `window_start` | timestamp | Rate limit window start | Default: now() |
| `created_at` | timestamp | Record creation time | Default: now() |

**Usage**: Webhook rate limiting and abuse prevention.

### `upgrade_interest`
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | uuid | Primary key | NOT NULL, PK, Default: gen_random_uuid() |
| `user_id` | uuid | References user profile | NOT NULL |
| `email_id` | text | User email | NOT NULL |
| `interest_date` | date | Interest expression date | Default: CURRENT_DATE |
| `click_count` | integer | Number of upgrade clicks | Default: 1 |
| `created_at` | timestamp | Record creation time | Default: now() |
| `updated_at` | timestamp | Last update time | Default: now() |

**Usage**: Tracking user interest in premium features.

---

## Row-Level Security (RLS) Policies

### User Data Protection
- **weight_entries**: Users can only access their own weight data
- **goals**: Users can only manage their own goals
- **profiles**: Users can view/edit their own profile; admins can view all
- **webhook_logs**: Users can view their own webhook logs; admins can view all

### Admin Protection
- **admin_logs**: Only admins can insert audit logs
- **app_config**: Only admins can view/modify system configuration
- **webhook_config**: System-level webhook configuration restricted to admins

### Rate Limiting Protection
- **webhook_rate_limits**: Users can manage their own rate limit records
- **api_requests**: System-managed request logging

---

## Database Functions

### Authentication & Authorization
- `get_current_user_admin_status()`: Check if current user is admin
- `is_admin(user_id)`: Verify admin status for specific user
- `handle_new_user()`: Automatically create profile on user registration

### Credit Management
- `use_credit(user_id)`: Deduct credit for AI insights usage
- `track_upgrade_interest(user_id, email)`: Track premium upgrade interest

### Rate Limiting
- `check_rate_limit()`: Validate API request rate limits
- `record_api_request()`: Log API request for rate limiting
- `check_webhook_rate_limit()`: Validate webhook rate limits
- `record_webhook_request()`: Log webhook request

### Data Processing
- `submit_user_data()`: Process user data submissions with rate limiting
- `process_webhook()`: Handle webhook processing with security checks

---

## Edge Functions

### AI Insights
- **send_ai_insights**: Generates AI-powered weight journey insights
  - Location: `supabase/functions/send_ai_insights/`
  - Integrates with external AI services for analysis

### Admin Operations
- **delete-user**: Handles user account deletion
- **delete-scheduled-accounts**: Processes scheduled account deletions
- **process_account_deletions**: Batch processes account deletions
- **admin-audit-log**: Logs administrative actions

### Webhook Management
- **get_webhook_config**: Retrieves webhook configuration
- **update_webhook_config**: Updates webhook settings