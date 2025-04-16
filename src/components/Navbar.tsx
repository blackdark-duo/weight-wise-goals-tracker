
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  UserCircle,
  BarChart2,
  Home,
  Target,
  Settings,
  LogOut,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const navLinks = [
    { title: "Home", href: "/" },
    { title: "Features", href: "/features" },
    { title: "Pricing", href: "/pricing" },
    { title: "About", href: "/about" }
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const authenticatedLinks = [
    { title: "Dashboard", href: "/dashboard", icon: Home },
    { title: "Goals", href: "/goals", icon: Target },
    { title: "Reports", href: "/reports", icon: BarChart2 },
    { title: "Account", href: "/account", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ui-border bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link 
          to={session ? "/dashboard" : "/"} 
          className="flex items-center gap-2 font-bold text-xl md:text-2xl text-brand-primary"
        >
          <Scale className="h-6 w-6" />
          <span>Weight</span>
          <span className="text-brand-secondary">Wise</span>
        </Link>

        {/* Desktop Navigation for Public Site */}
        {!session && (
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
        )}
        
        {/* Desktop Account/CTA */}
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>
                      <div className="flex items-center gap-2 font-bold text-xl text-brand-primary">
                        <Scale className="h-5 w-5" />
                        <span>WeightWise</span>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="mt-8 flex flex-col gap-2">
                    {authenticatedLinks.map((link) => (
                      <Link
                        key={link.title}
                        to={link.href}
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <link.icon className="h-4 w-4" />
                        <span>{link.title}</span>
                      </Link>
                    ))}
                    <Button 
                      variant="ghost" 
                      className="flex items-center justify-start gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-4">
                <Link to="/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Get Started</Button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={toggleMenu}
                className="md:hidden p-2"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu for Public Site */}
      {!session && (
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
              <Link to="/signin" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full" variant="outline">Sign In</Button>
              </Link>
              <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
