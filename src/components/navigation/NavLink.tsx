
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NavItem } from "./types";

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  children?: React.ReactNode;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
}

export const NavLink = ({
  item,
  isActive,
  children,
  className,
  activeClassName = "",
  inactiveClassName = ""
}: NavLinkProps) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (item.onClick) {
      e.preventDefault();
      item.onClick();
    }
  };

  return (
    <Link
      to={item.href}
      onClick={handleClick}
      className={cn(
        className,
        isActive ? activeClassName : inactiveClassName
      )}
    >
      {children}
    </Link>
  );
};
