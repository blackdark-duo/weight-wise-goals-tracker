
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown, LogOut, Settings, User, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface DashboardHeaderProps {
  title: string;
}

const DashboardHeader = ({ title }: DashboardHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { preferredUnit } = useUserPreferences();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background border-b">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="font-bold text-xl">WeightWise</span>
          </Link>
          <span className="hidden md:inline-block text-muted-foreground">|</span>
          <h1 className="text-lg font-medium hidden md:block">{title}</h1>
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0">
            <SheetHeader className="border-b p-4">
              <SheetTitle>WeightWise</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2 p-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart2 className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                to="/goals"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                Goals
              </Link>
              <Link
                to="/reports"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart2 className="h-5 w-5" />
                Reports
              </Link>
              <Link
                to="/account"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="h-5 w-5" />
                Account
              </Link>
              <Button
                variant="outline"
                className="justify-start gap-2 mt-4"
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </Button>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/dashboard"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/goals"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Goals
          </Link>
          <Link
            to="/reports"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Reports
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1 items-center">
                Account
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="flex items-center">
                <span className="text-xs font-normal text-muted-foreground">
                  Preferred unit: {preferredUnit}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/account" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
};

export default DashboardHeader;
