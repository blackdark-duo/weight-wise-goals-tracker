# Weight Wise Pages Documentation

This document provides a comprehensive overview of all pages in the Weight Wise application, including their purpose, routes, and key functionality.

---

## Public Pages

### Landing Page
- **File**: `src/pages/Index.tsx`
- **Route**: `/`
- **Description**: Welcome page with hero section, features showcase, testimonials, and call-to-action
- **Key Features**:
  - Hero section with app introduction
  - Features highlighting weight tracking capabilities
  - Call-to-action buttons directing to signup
  - Footer with navigation links

### Authentication Pages

#### Sign In
- **File**: `src/pages/SignIn.tsx`
- **Route**: `/signin`
- **Description**: User authentication login form
- **Key Features**:
  - Email/password login form
  - Integration with Supabase Auth
  - Redirect to dashboard on successful login
  - Link to forgot password and signup pages

#### Sign Up
- **File**: `src/pages/SignUp.tsx`
- **Route**: `/signup`
- **Description**: User registration form
- **Key Features**:
  - Email/password registration
  - Account creation with Supabase Auth
  - Automatic profile creation via database trigger
  - Email verification process

#### Forgot Password
- **File**: `src/pages/ForgotPassword.tsx`
- **Route**: `/forgot-password`
- **Description**: Password reset functionality
- **Key Features**:
  - Email-based password reset
  - Integration with Supabase Auth recovery
  - User-friendly reset flow

### Informational Pages

#### About
- **File**: `src/pages/About.tsx`
- **Route**: `/about`
- **Description**: Company information and mission statement
- **Key Features**:
  - App overview and benefits
  - Company mission and values
  - Team information (if applicable)

#### Features
- **File**: `src/pages/Features.tsx`
- **Route**: `/features`
- **Description**: Detailed showcase of app features
- **Key Features**:
  - Comprehensive feature list
  - Feature descriptions and benefits
  - Visual representations of capabilities

#### Pricing
- **File**: `src/pages/Pricing.tsx`
- **Route**: `/pricing`
- **Description**: Pricing plans and subscription options
- **Key Features**:
  - Pricing tier comparison
  - Feature breakdown by plan
  - Call-to-action for upgrades
  - Currency selection support

#### Contact Us
- **File**: `src/pages/ContactUs.tsx`
- **Route**: `/contact`
- **Description**: Contact form and company information
- **Key Features**:
  - Contact form for user inquiries
  - Company contact information
  - Support channels

### Legal Pages

#### Privacy Policy
- **File**: `src/pages/PrivacyPolicy.tsx`
- **Route**: `/privacy`
- **Description**: Privacy policy and data handling practices
- **Key Features**:
  - Data collection policies
  - User privacy rights
  - Data usage and sharing practices

#### Terms of Service
- **File**: `src/pages/TermsOfService.tsx`
- **Route**: `/terms`
- **Description**: Terms and conditions for app usage
- **Key Features**:
  - User agreement terms
  - Service usage guidelines
  - Legal disclaimers

---

## Protected Pages (Require Authentication)

### Dashboard
- **File**: `src/pages/Dashboard.tsx`
- **Route**: `/dashboard`
- **Description**: Main user dashboard with weight tracking, charts, and insights
- **Key Features**:
  - Weight entry form for daily tracking
  - Interactive weight progress charts
  - Recent weight entries display
  - AI-powered insights panel
  - Quick action buttons
  - Goal progress overview
- **Database Interactions**:
  - Queries `weight_entries` for user's weight data
  - Updates `profiles` for user preferences
  - Interacts with AI insights system

### Account Management
- **File**: `src/pages/Account.tsx`
- **Route**: `/account`
- **Description**: User profile management, preferences, and settings
- **Key Features**:
  - Profile information editing
  - Password change functionality
  - Unit preferences (kg/lbs)
  - Timezone settings
  - Data export capabilities
  - Webhook configuration
  - Account deletion options
- **Database Interactions**:
  - Updates `profiles` table for user settings
  - Manages webhook configurations
  - Handles data export requests

### Reports
- **File**: `src/pages/Reports.tsx`
- **Route**: `/reports`
- **Description**: Detailed analytics and progress reports
- **Key Features**:
  - Comprehensive weight statistics
  - Progress trend analysis
  - Goal achievement tracking
  - Historical data visualization
  - Export functionality for reports
- **Database Interactions**:
  - Complex queries on `weight_entries`
  - Analysis of `goals` progress
  - Statistical calculations

### Goals
- **File**: `src/pages/Goals.tsx`
- **Route**: `/goals`
- **Description**: Weight goal setting and tracking
- **Key Features**:
  - Goal creation and editing
  - Progress tracking toward targets
  - Goal achievement recognition
  - Multiple concurrent goals support
  - Target weight and date setting
- **Database Interactions**:
  - CRUD operations on `goals` table
  - Progress calculations based on `weight_entries`
  - Goal completion tracking

### Error Page
- **File**: `src/pages/NotFound.tsx`
- **Route**: `*` (catch-all)
- **Description**: 404 error page for invalid routes
- **Key Features**:
  - User-friendly error message
  - Navigation back to main app
  - Helpful links to key pages

---

## Route Configuration

### Public Routes
All public pages are accessible without authentication and include:
- Landing page (`/`)
- Authentication pages (`/signin`, `/signup`, `/forgot-password`)
- Informational pages (`/about`, `/features`, `/pricing`, `/contact`)
- Legal pages (`/privacy`, `/terms`)

### Protected Routes
Protected routes require user authentication and redirect to `/signin` if not authenticated:
- Dashboard (`/dashboard`)
- Account management (`/account`)
- Reports (`/reports`)
- Goals (`/goals`)

### Route Redirects
- `/settings` → `/account` (legacy redirect)
- `/domain` → `/account` (legacy redirect)

---

## Mobile Navigation
- **Component**: `MobileNavigation`
- **Display Logic**: Only shown for authenticated users
- **Features**: Bottom navigation bar for mobile devices with quick access to main app sections

---

## Authentication Flow
1. Unauthenticated users can access public pages
2. Attempting to access protected routes redirects to `/signin`
3. Successful authentication redirects to `/dashboard`
4. Session persistence maintains authentication state
5. Logout redirects to landing page