/**
 * Dashboard Layout Component
 * Provides the main layout structure for dashboard pages
 * Single responsibility: Dashboard UI layout and navigation structure
 */

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Home, Target as TargetIcon, BarChart2, UserCircle, Settings } from "lucide-react";
import { HamburgerMenu } from "@/components/ui/hamburger-menu";
import MobileNavigation from "@/components/MobileNavigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  headerActions?: React.ReactNode;
  showMobileNav?: boolean;
}

const dashboardNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Goals", href: "/goals", icon: TargetIcon },
  { title: "Reports", href: "/reports", icon: BarChart2 },
  { title: "Account", href: "/account", icon: UserCircle },
  { title: "Settings", href: "/settings", icon: Settings },
];

/**
 * Dashboard layout wrapper component
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title = "Dashboard",
  headerActions,
  showMobileNav = true
}) => {
  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <HamburgerMenu items={dashboardNavItems} />
          </div>
          <div className="flex items-center gap-2">
            {headerActions || (
              <Button variant="outline" size="sm" asChild>
                <Link to="/reports">
                  <Calendar className="mr-2 h-4 w-4" />
                  Reports
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col space-y-6">
          {children}
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {showMobileNav && <MobileNavigation />}
    </div>
  );
};