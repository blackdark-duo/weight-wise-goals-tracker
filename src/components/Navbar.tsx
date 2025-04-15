
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn] = useState(false); // This will be connected to Supabase later

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const navLinks = [
    { title: "Home", href: "/" },
    { title: "Features", href: "/features" },
    { title: "Pricing", href: "/pricing" },
    { title: "About", href: "/about" }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ui-border bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl md:text-2xl text-brand-primary">
          <span>Weight</span>
          <span className="text-brand-secondary">Wise</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.title}
              to={link.href}
              className="text-sm font-medium transition-colors hover:text-brand-primary"
            >
              {link.title}
            </Link>
          ))}
        </nav>
        
        {/* Desktop Account/CTA */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <Link to="/account">
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserCircle className="h-6 w-6" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden p-2"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={cn(
          "md:hidden fixed inset-x-0 top-16 z-50 h-[calc(100vh-4rem)] bg-white transition-transform duration-300 ease-in-out",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="container flex flex-col gap-6 p-6">
          <nav className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.title}
                to={link.href}
                className="text-lg font-medium transition-colors hover:text-brand-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.title}
              </Link>
            ))}
          </nav>
          
          <div className="flex flex-col gap-4 mt-auto">
            {isLoggedIn ? (
              <Link to="/account" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full justify-start" variant="outline">
                  <UserCircle className="mr-2 h-5 w-5" />
                  Account
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signin" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full" variant="outline">Sign In</Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </>
            )}
          </div>
          
          {isLoggedIn && (
            <Link to="/account" className="fixed bottom-6 right-6 md:hidden" onClick={() => setIsMenuOpen(false)}>
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12 shadow-lg">
                <UserCircle className="h-6 w-6" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
