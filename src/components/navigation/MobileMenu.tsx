
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NavItem } from "./types";

interface MobileMenuProps {
  isOpen: boolean;
  navLinks: NavItem[];
  setIsMenuOpen: (isOpen: boolean) => void;
}

export const MobileMenu = ({ isOpen, navLinks, setIsMenuOpen }: MobileMenuProps) => {
  return (
    <div 
      className={cn(
        "md:hidden fixed inset-x-0 top-16 z-50 h-[calc(100vh-4rem)] bg-white transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="container flex flex-col gap-6 p-6">
        <nav className="flex flex-col gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.title}
              to={link.href}
              className="text-lg font-medium transition-colors hover:text-[#ff7f50]"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.title}
            </Link>
          ))}
        </nav>
        
        <div className="flex flex-col gap-4 mt-auto">
          <Link to="/signin" onClick={() => setIsMenuOpen(false)}>
            <Button className="w-full" variant="outline">Sign In</Button>
          </Link>
          <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
            <Button className="w-full bg-[#ff7f50] hover:bg-orange-600">Get Started</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
