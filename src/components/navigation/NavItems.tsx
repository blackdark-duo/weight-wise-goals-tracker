
import { Link } from "react-router-dom";
import { NavItem } from "./types";

interface NavItemsProps {
  navLinks: NavItem[];
}

export const NavItems = ({ navLinks }: NavItemsProps) => {
  return (
    <nav className="hidden md:flex items-center gap-6">
      {navLinks.map((link) => (
        <Link 
          key={link.title}
          to={link.href}
          className="text-sm font-medium transition-colors hover:text-[#ff7f50]"
        >
          {link.title}
        </Link>
      ))}
    </nav>
  );
};
