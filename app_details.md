# Weight Wise App Documentation

## App Overview
Weight Wise is a comprehensive weight tracking and goal management web application built with React, TypeScript, Vite, and Supabase. The app provides users with tools to track their weight journey, set goals, analyze progress, and receive AI-powered insights.

## Technology Stack
- **Frontend**: React 18.3.1, TypeScript, Vite
- **UI Framework**: Tailwind CSS, Radix UI components, Shadcn/ui
- **Backend**: Supabase (PostgreSQL database, authentication, edge functions)
- **State Management**: TanStack React Query
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Form Handling**: React Hook Form with Zod validation

---

## Pages

### Public Pages
| Page | File | Description | Route |
|------|------|-------------|-------|
| **Landing Page** | `src/pages/Index.tsx` | Welcome page with hero section, features, testimonials, and CTA | `/` |
| **Sign In** | `src/pages/SignIn.tsx` | User authentication login form | `/signin` |
| **Sign Up** | `src/pages/SignUp.tsx` | User registration form | `/signup` |
| **Forgot Password** | `src/pages/ForgotPassword.tsx` | Password reset functionality | `/forgot-password` |
| **About** | `src/pages/About.tsx` | Company information and mission | `/about` |
| **Features** | `src/pages/Features.tsx` | Detailed feature showcase | `/features` |
| **Pricing** | `src/pages/Pricing.tsx` | Pricing plans and subscription options | `/pricing` |
| **Contact Us** | `src/pages/ContactUs.tsx` | Contact form and information | `/contact` |
| **Privacy Policy** | `src/pages/PrivacyPolicy.tsx` | Privacy policy and data handling | `/privacy` |
| **Terms of Service** | `src/pages/TermsOfService.tsx` | Terms and conditions | `/terms` |
| **404 Not Found** | `src/pages/NotFound.tsx` | Error page for invalid routes | `*` |

### Protected Pages (Require Authentication)
| Page | File | Description | Route |
|------|------|-------------|-------|
| **Dashboard** | `src/pages/Dashboard.tsx` | Main user dashboard with weight tracking, charts, and insights | `/dashboard` |
| **Account** | `src/pages/Account.tsx` | User profile management, preferences, and settings | `/account` |
| **Reports** | `src/pages/Reports.tsx` | Detailed analytics and progress reports | `/reports` |
| **Goals** | `src/pages/Goals.tsx` | Weight goal setting and tracking | `/goals` |

---

## Core Components

### Navigation Components
| Component | File | Description |
|-----------|------|-------------|
| **Navbar** | `src/components/navigation/Navbar.tsx` | Main navigation bar with responsive design |
| **Mobile Navigation** | `src/components/navigation/MobileNavigation.tsx` | Bottom navigation for mobile devices |
| **Nav Items** | `src/components/navigation/NavItems.tsx` | Navigation menu items configuration |
| **Nav Link** | `src/components/navigation/NavLink.tsx` | Individual navigation link component |
| **Nav Logo** | `src/components/navigation/NavLogo.tsx` | Application logo in navigation |
| **Mobile Menu** | `src/components/navigation/MobileMenu.tsx` | Hamburger menu for mobile |

### Dashboard Components
| Component | File | Description |
|-----------|------|-------------|
| **Weight Entry Form** | `src/components/dashboard/WeightEntryForm.tsx` | Form for adding new weight entries |
| **Weight Chart** | `src/components/dashboard/WeightChart.tsx` | Interactive weight progress chart |
| **Recent Entries** | `src/components/dashboard/RecentEntries.tsx` | List of recent weight entries |
| **AI Insights** | `src/components/dashboard/AIInsights.tsx` | AI-powered weight journey insights |
| **Credits Display** | `src/components/dashboard/CreditsDisplay.tsx` | User's available AI credits display |
| **Quick Actions** | `src/components/dashboard/QuickActions.tsx` | Shortcut buttons for common actions |
| **Dashboard Layout** | `src/components/dashboard/DashboardLayout.tsx` | Layout wrapper for dashboard pages |

### Account Management Components
| Component | File | Description |
|-----------|------|-------------|
| **Profile Section** | `src/components/account/ProfileSection.tsx` | User profile information management |
| **Preferences Section** | `src/components/account/PreferencesSection.tsx` | User preferences and settings |
| **Change Password** | `src/components/account/ChangePassword.tsx` | Password change functionality |
| **Account Actions** | `src/components/account/AccountActions.tsx` | Account management actions |
| **Data Management** | `src/components/account/DataManagementSection.tsx` | Data export and management |
| **Webhook Settings** | `src/components/account/WebhookSettings.tsx` | Webhook configuration |

### Admin Components
| Component | File | Description |
|-----------|------|-------------|
| **Admin Auth Guard** | `src/components/admin/AdminAuthGuard.tsx` | Admin authentication protection |
| **User Management** | `src/components/admin/UserManagementTab.tsx` | User administration interface |
| **Admin Header** | `src/components/admin/AdminHeader.tsx` | Admin panel header |
| **Security Audit** | `src/components/admin/AdminSecurityAudit.tsx` | Security monitoring and logs |
| **Webhook Configuration** | `src/components/admin/AdminWebhookConfig.tsx` | System-wide webhook settings |

### UI Components (Shadcn/ui)
| Component | File | Description |
|-----------|------|-------------|
| **Button** | `src/components/ui/button.tsx` | Reusable button component with variants |
| **Card** | `src/components/ui/card.tsx` | Card container component |
| **Dialog** | `src/components/ui/dialog.tsx` | Modal dialog component |
| **Form** | `src/components/ui/form.tsx` | Form wrapper with validation |
| **Input** | `src/components/ui/input.tsx` | Text input component |
| **Toast** | `src/components/ui/toast.tsx` | Notification toast component |
| **Tabs** | `src/components/ui/tabs.tsx` | Tab navigation component |
| **Chart** | `src/components/ui/chart.tsx` | Chart wrapper for Recharts |

---

## Core Functionalities

### Authentication & Authorization
- **User Registration**: Email/password signup with email verification
- **User Login**: Secure authentication via Supabase Auth
- **Password Reset**: Forgot password functionality
- **Session Management**: Persistent sessions with automatic token refresh
- **Admin Roles**: Role-based access control for administrative functions
- **Account Management**: Profile updates, password changes, account deletion

### Weight Tracking
- **Weight Entry**: Add daily weight measurements with optional notes
- **Unit Support**: Kilograms and pounds with automatic conversion
- **Historical Data**: View and manage past weight entries
- **Data Visualization**: Interactive charts showing weight trends
- **Progress Analytics**: Statistical analysis of weight changes

### Goal Management
- **Goal Setting**: Define target weight and timeline
- **Progress Tracking**: Monitor progress towards goals
- **Achievement Recognition**: Mark goals as completed
- **Multiple Goals**: Support for multiple concurrent goals

### AI-Powered Insights
- **Smart Analysis**: AI-generated insights about weight patterns
- **Trend Recognition**: Identify weight loss/gain trends
- **Personalized Recommendations**: Tailored advice based on user data
- **Credit System**: Usage-based credit system for AI features

### Data Management
- **Export Functionality**: Download weight data in CSV format
- **Data Backup**: Secure cloud storage of user data
- **Privacy Controls**: User control over data sharing and visibility
- **Bulk Operations**: Import/export of weight entries

### Webhook Integration
- **External Integration**: Send weight data to external services
- **Rate Limiting**: Prevent abuse with configurable limits
- **Logging**: Comprehensive webhook activity logs
- **Custom Fields**: Configurable data fields for webhooks

---

## Supabase Database Schema

### Core Tables

#### `profiles`
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

#### `weight_entries`
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

#### `goals`
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

### Configuration Tables

#### `webhook_config`
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

#### `app_config`
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | bigint | Configuration ID | NOT NULL, PK |
| `key` | text | Configuration key | NOT NULL |
| `value` | text | Configuration value | NULL |
| `created_at` | timestamp | Record creation time | Default: now() |
| `updated_at` | timestamp | Last update time | Default: now() |

**Usage**: Application-wide configuration settings.

### Logging & Analytics Tables

#### `webhook_logs`
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

#### `admin_logs`
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

#### `api_requests`
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | uuid | Primary key | NOT NULL, PK, Default: gen_random_uuid() |
| `user_id` | uuid | References user profile | NULL |
| `endpoint` | text | API endpoint | NOT NULL |
| `ip_address` | text | Client IP address | NULL |
| `created_at` | timestamp | Request timestamp | Default: now() |

**Usage**: API usage tracking and rate limiting.

### Rate Limiting Tables

#### `webhook_rate_limits`
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | uuid | Primary key | NOT NULL, PK, Default: gen_random_uuid() |
| `user_id` | uuid | References user profile | NOT NULL |
| `operation` | text | Operation type | NOT NULL |
| `request_count` | integer | Current request count | Default: 1 |
| `window_start` | timestamp | Rate limit window start | Default: now() |
| `created_at` | timestamp | Record creation time | Default: now() |

**Usage**: Webhook rate limiting and abuse prevention.

#### `upgrade_interest`
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

---

## Security Features

### Authentication Security
- Supabase Auth integration with email verification
- Session management with automatic token refresh
- Password reset functionality
- Rate limiting on authentication attempts

### Data Security
- Row-Level Security (RLS) policies on all tables
- Admin privilege escalation protection
- Audit logging for administrative actions
- IP address tracking for security monitoring

### API Security
- Rate limiting on all endpoints
- CORS configuration for cross-origin requests
- Input validation using Zod schemas
- SQL injection prevention through parameterized queries

---

## File Structure

```
src/
├── components/
│   ├── account/          # Account management components
│   ├── admin/            # Admin panel components
│   ├── dashboard/        # Dashboard-specific components
│   ├── navigation/       # Navigation components
│   ├── ui/              # Reusable UI components (Shadcn/ui)
│   └── webhook/         # Webhook-related components
├── hooks/               # Custom React hooks
├── integrations/        # External integrations (Supabase)
├── lib/                # Utility libraries
├── pages/              # Page components
├── providers/          # React context providers
├── services/           # Business logic services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions

supabase/
├── functions/          # Edge functions
├── migrations/         # Database migrations
└── config.toml        # Supabase configuration
```

---

## Development Notes

### Environment Setup
- Uses Vite for fast development and building
- TypeScript for type safety
- ESLint for code quality
- React Query for server state management

### State Management
- React Query for server state caching
- React Context for authentication state
- Local component state for UI interactions

### Styling
- Tailwind CSS for utility-first styling
- Custom design system with semantic tokens
- Responsive design for mobile/desktop
- Dark/light mode support via next-themes

This documentation provides a comprehensive overview of the Weight Wise application architecture, database schema, and component structure for development and maintenance reference.