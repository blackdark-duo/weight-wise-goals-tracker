# Weight Wise Components Documentation

This document provides a comprehensive overview of all components in the Weight Wise application, organized by category and functionality.

---

## Navigation Components

### Core Navigation
| Component | File | Description |
|-----------|------|-------------|
| **Navbar** | `src/components/navigation/Navbar.tsx` | Main navigation bar with responsive design and user authentication state |
| **Mobile Navigation** | `src/components/navigation/MobileNavigation.tsx` | Bottom navigation for mobile devices with tab-based navigation |
| **Nav Items** | `src/components/navigation/NavItems.tsx` | Navigation menu items configuration and rendering |
| **Nav Link** | `src/components/navigation/NavLink.tsx` | Individual navigation link component with active state styling |
| **Nav Logo** | `src/components/navigation/NavLogo.tsx` | Application logo component displayed in navigation |
| **Mobile Menu** | `src/components/navigation/MobileMenu.tsx` | Hamburger menu for mobile navigation |

### Navigation Features
- Responsive design for desktop and mobile
- Authentication-aware navigation items
- Active route highlighting
- Mobile-first approach with collapsible menu

---

## Dashboard Components

### Core Dashboard
| Component | File | Description |
|-----------|------|-------------|
| **Dashboard Layout** | `src/components/dashboard/DashboardLayout.tsx` | Layout wrapper for dashboard pages with consistent structure |
| **Weight Entry Form** | `src/components/dashboard/WeightEntryForm.tsx` | Form for adding new weight entries with validation |
| **Weight Chart** | `src/components/dashboard/WeightChart.tsx` | Interactive weight progress chart using Recharts |
| **Recent Entries** | `src/components/dashboard/RecentEntries.tsx` | List display of recent weight entries with edit/delete actions |
| **AI Insights** | `src/components/dashboard/AIInsights.tsx` | AI-powered weight journey insights display |
| **AI Insights View** | `src/components/dashboard/AIInsightsView.tsx` | Detailed view for AI-generated insights |
| **Credits Display** | `src/components/dashboard/CreditsDisplay.tsx` | User's available AI credits counter |
| **Quick Actions** | `src/components/dashboard/QuickActions.tsx` | Shortcut buttons for common dashboard actions |

### Dashboard Features
- Real-time weight tracking
- Interactive data visualization
- AI-powered insights with credit system
- Quick entry and editing capabilities
- Progress monitoring and analytics

---

## Account Management Components

### Profile Management
| Component | File | Description |
|-----------|------|-------------|
| **Account Management** | `src/components/AccountManagement.tsx` | Main account management container |
| **Profile Section** | `src/components/account/ProfileSection.tsx` | User profile information management |
| **Profile Form** | `src/components/account/ProfileForm.tsx` | Form for editing user profile details |
| **Account Profile** | `src/components/account/AccountProfile.tsx` | Profile display and editing interface |

### Preferences & Settings
| Component | File | Description |
|-----------|------|-------------|
| **Preferences Section** | `src/components/account/PreferencesSection.tsx` | User preferences and settings management |
| **Preferences Form** | `src/components/account/PreferencesForm.tsx` | Form for updating user preferences |
| **Account Preferences** | `src/components/account/AccountPreferences.tsx` | Preference management interface |

### Security & Authentication
| Component | File | Description |
|-----------|------|-------------|
| **Change Password** | `src/components/account/ChangePassword.tsx` | Password change functionality |
| **Password Form** | `src/components/account/PasswordForm.tsx` | Form for password updates |
| **Account Actions** | `src/components/account/AccountActions.tsx` | Account-level action buttons |

### Data Management
| Component | File | Description |
|-----------|------|-------------|
| **Data Management Section** | `src/components/account/DataManagementSection.tsx` | Data export and management tools |
| **Data Management Card** | `src/components/account/DataManagementCard.tsx` | Card component for data management options |
| **Account Data Management** | `src/components/account/AccountDataManagement.tsx` | Main data management interface |

### Webhook Configuration
| Component | File | Description |
|-----------|------|-------------|
| **Webhook Settings** | `src/components/account/WebhookSettings.tsx` | User webhook configuration interface |

### Danger Zone
| Component | File | Description |
|-----------|------|-------------|
| **Danger Zone Section** | `src/components/account/DangerZoneSection.tsx` | Account deletion and dangerous actions |
| **Danger Zone Card** | `src/components/account/DangerZoneCard.tsx` | Card component for dangerous actions |
| **Account Danger Zone** | `src/components/account/AccountDangerZone.tsx` | Account deletion interface |

---

## Admin Components

### Authentication & Guards
| Component | File | Description |
|-----------|------|-------------|
| **Admin Auth Guard** | `src/components/admin/AdminAuthGuard.tsx` | Authentication protection for admin routes |
| **Admin Auth Message** | `src/components/admin/AdminAuthMessage.tsx` | Authentication messages for admin access |
| **Admin Loader** | `src/components/admin/AdminLoader.tsx` | Loading component for admin operations |

### Admin Interface
| Component | File | Description |
|-----------|------|-------------|
| **Admin Header** | `src/components/admin/AdminHeader.tsx` | Header component for admin panel |
| **User Management Tab** | `src/components/admin/UserManagementTab.tsx` | Tab for user administration |
| **App Controls Tab** | `src/components/admin/AppControlsTab.tsx` | Tab for application controls |

### User Management
| Component | File | Description |
|-----------|------|-------------|
| **Admin User Table** | `src/components/admin/AdminUserTable.tsx` | Table displaying all users for admin management |
| **User Table** | `src/components/admin/UserTable.tsx` | Reusable user table component |
| **User Actions** | `src/components/admin/UserActions.tsx` | Action buttons for user management |
| **User Management** | `src/components/admin/users/UserManagement.tsx` | Complete user management interface |

### Security & Monitoring
| Component | File | Description |
|-----------|------|-------------|
| **Admin Security Audit** | `src/components/admin/AdminSecurityAudit.tsx` | Security monitoring and audit logs |
| **Admin Logger** | `src/components/admin/AdminLogger.tsx` | Admin action logging interface |

### Webhook Administration
| Component | File | Description |
|-----------|------|-------------|
| **Admin Webhook Config** | `src/components/admin/AdminWebhookConfig.tsx` | System-wide webhook configuration |
| **Admin Webhook Logs** | `src/components/admin/AdminWebhookLogs.tsx` | Webhook activity logs for admin review |
| **Admin Webhook Tester** | `src/components/admin/AdminWebhookTester.tsx` | Webhook testing interface |
| **Webhook Settings** | `src/components/admin/WebhookSettings.tsx` | Webhook configuration settings |

---

## Webhook Components

### Atomic Components
| Component | File | Description |
|-----------|------|-------------|
| **Webhook Icon** | `src/components/webhook/atoms/WebhookIcon.tsx` | Icon component for webhook status |
| **Webhook Status Badge** | `src/components/webhook/atoms/WebhookStatusBadge.tsx` | Status indicator for webhooks |
| **Webhook Test Button** | `src/components/webhook/atoms/WebhookTestButton.tsx` | Button for testing webhook endpoints |
| **Webhook URL Input** | `src/components/webhook/atoms/WebhookUrlInput.tsx` | Input field for webhook URLs |

### Molecular Components
| Component | File | Description |
|-----------|------|-------------|
| **Webhook Config Form** | `src/components/webhook/molecules/WebhookConfigForm.tsx` | Form for webhook configuration |
| **Webhook Test Panel** | `src/components/webhook/molecules/WebhookTestPanel.tsx` | Panel for webhook testing and results |

### Webhook Hooks
| Component | File | Description |
|-----------|------|-------------|
| **useWebhookConfig** | `src/components/webhook/hooks/useWebhookConfig.ts` | Hook for webhook configuration management |
| **useWebhookTest** | `src/components/webhook/hooks/useWebhookTest.ts` | Hook for webhook testing functionality |

---

## UI Components (Shadcn/ui)

### Form Components
| Component | File | Description |
|-----------|------|-------------|
| **Button** | `src/components/ui/button.tsx` | Reusable button component with multiple variants |
| **Input** | `src/components/ui/input.tsx` | Text input component with validation support |
| **Form** | `src/components/ui/form.tsx` | Form wrapper with validation and error handling |
| **Label** | `src/components/ui/label.tsx` | Form label component |
| **Textarea** | `src/components/ui/textarea.tsx` | Multi-line text input component |
| **Select** | `src/components/ui/select.tsx` | Dropdown select component |
| **Checkbox** | `src/components/ui/checkbox.tsx` | Checkbox input component |
| **Radio Group** | `src/components/ui/radio-group.tsx` | Radio button group component |
| **Switch** | `src/components/ui/switch.tsx` | Toggle switch component |

### Layout Components
| Component | File | Description |
|-----------|------|-------------|
| **Card** | `src/components/ui/card.tsx` | Card container component for content grouping |
| **Separator** | `src/components/ui/separator.tsx` | Visual separator component |
| **Tabs** | `src/components/ui/tabs.tsx` | Tab navigation component |
| **Accordion** | `src/components/ui/accordion.tsx` | Collapsible content sections |
| **Collapsible** | `src/components/ui/collapsible.tsx` | Collapsible content component |

### Feedback Components
| Component | File | Description |
|-----------|------|-------------|
| **Toast** | `src/components/ui/toast.tsx` | Notification toast component |
| **Toaster** | `src/components/ui/toaster.tsx` | Toast container and manager |
| **Alert** | `src/components/ui/alert.tsx` | Alert message component |
| **Alert Dialog** | `src/components/ui/alert-dialog.tsx` | Modal alert dialog |
| **Progress** | `src/components/ui/progress.tsx` | Progress indicator component |
| **Skeleton** | `src/components/ui/skeleton.tsx` | Loading skeleton component |

### Navigation Components
| Component | File | Description |
|-----------|------|-------------|
| **Dialog** | `src/components/ui/dialog.tsx` | Modal dialog component |
| **Sheet** | `src/components/ui/sheet.tsx` | Side panel component |
| **Drawer** | `src/components/ui/drawer.tsx` | Drawer component for mobile |
| **Popover** | `src/components/ui/popover.tsx` | Popover tooltip component |
| **Dropdown Menu** | `src/components/ui/dropdown-menu.tsx` | Dropdown menu component |
| **Context Menu** | `src/components/ui/context-menu.tsx` | Right-click context menu |

### Data Display Components
| Component | File | Description |
|-----------|------|-------------|
| **Table** | `src/components/ui/table.tsx` | Data table component |
| **Chart** | `src/components/ui/chart.tsx` | Chart wrapper for Recharts integration |
| **Avatar** | `src/components/ui/avatar.tsx` | User avatar component |
| **Badge** | `src/components/ui/badge.tsx` | Status badge component |
| **Calendar** | `src/components/ui/calendar.tsx` | Date picker calendar |

---

## Landing Page Components

### Hero Section
| Component | File | Description |
|-----------|------|-------------|
| **Hero Section** | `src/components/HeroSection.tsx` | Main hero section for landing page |
| **Hero Title** | `src/components/hero/HeroTitle.tsx` | Main title with animated text |
| **Hero Description** | `src/components/hero/HeroDescription.tsx` | Hero section description text |
| **Hero Buttons** | `src/components/hero/HeroButtons.tsx` | Call-to-action buttons |
| **Hero Image** | `src/components/hero/HeroImage.tsx` | Hero section imagery |
| **Hero Rating** | `src/components/hero/HeroRating.tsx` | Star rating display |

### Content Sections
| Component | File | Description |
|-----------|------|-------------|
| **Features Section** | `src/components/FeaturesSection.tsx` | App features showcase |
| **Testimonials Section** | `src/components/TestimonialsSection.tsx` | Customer testimonials |
| **Footer** | `src/components/Footer.tsx` | Site footer with links |

---

## Specialized Components

### Analytics & Insights
| Component | File | Description |
|-----------|------|-------------|
| **Weight Journey Insights** | `src/components/WeightJourneyInsights.tsx` | Comprehensive weight analysis |
| **Goal Progress Card** | `src/components/GoalProgressCard.tsx` | Goal tracking progress display |
| **Comparison Table** | `src/components/ComparisonTable.tsx` | Feature comparison table |

### Pricing Components
| Component | File | Description |
|-----------|------|-------------|
| **Pricing Hero** | `src/components/pricing/PricingHero.tsx` | Pricing page hero section |
| **Pricing Tier** | `src/components/pricing/PricingTier.tsx` | Individual pricing plan component |
| **Pricing CTA** | `src/components/pricing/PricingCTA.tsx` | Call-to-action for pricing |
| **Pricing FAQ** | `src/components/pricing/PricingFAQ.tsx` | Frequently asked questions |
| **Currency Selector** | `src/components/pricing/CurrencySelector.tsx` | Currency selection for pricing |

### Utility Components
| Component | File | Description |
|-----------|------|-------------|
| **Dashboard Header** | `src/components/DashboardHeader.tsx` | Header for dashboard pages |
| **Supabase Note** | `src/components/SupabaseNote.tsx` | Development note component |
| **Scroll To Top** | `src/components/ScrollToTop.tsx` | Scroll to top functionality |

---

## Component Architecture

### Design System
- All components use Tailwind CSS with semantic tokens
- Consistent color scheme and typography
- Dark/light mode support via next-themes
- Responsive design principles

### State Management
- React Query for server state caching
- React Context for authentication state
- Local component state for UI interactions
- Custom hooks for business logic

### Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### Performance
- Lazy loading for large components
- Memoization for expensive calculations
- Efficient re-rendering strategies
- Code splitting for optimal bundles