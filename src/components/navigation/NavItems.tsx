
import React from "react";
import { NavItem } from "./types";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

type NavItemsProps = {
  navLinks: NavItem[];
  hideLinks?: string[];
};

export const NavItems = ({ navLinks, hideLinks = [] }: NavItemsProps) => {
  const location = useLocation();

  return (
    <nav className="hidden md:flex items-center gap-2">
      {navLinks.map((link, index) => {
        // Skip rendering links that should be hidden
        if (hideLinks.includes(link.title)) {
          return null;
        }
        
        return (
          <Link
            key={index}
            to={link.href}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors",
              location.pathname === link.href
                ? "text-[#ff7f50]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {link.title}
          </Link>
        );
      })}
    </nav>
  );
};
