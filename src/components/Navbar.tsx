
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { HamburgerMenu } from "./ui/hamburger-menu";
import { Home, Target, BarChart2, UserCircle } from "lucide-react";

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
    { title: "Account", href: "/account", icon: UserCircle },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ui-border bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link 
          to={session ? "/dashboard" : "/"} 
          className="flex items-center gap-2 font-bold text-xl md:text-2xl text-[#ff7f50]"
        >
          <img
            src="/lovable-uploads/6b04f662-fb0c-44df-9e2d-b98a7410f381.png"
            alt="Weight Wise Logo"
            className="h-8 w-8"
          />
          <span className="bg-gradient-to-r from-[#ff7f50] to-[#ff6347] bg-clip-text text-transparent">
            WeightWise
          </span>
        </Link>

        {!session && (
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
        )}
        
        <div className="flex items-center gap-4">
          {session ? (
            <HamburgerMenu 
              items={[
                ...authenticatedLinks,
                { title: "Sign Out", href: "#", icon: LogOut, onClick: handleSignOut },
              ]} 
            />
          ) : (
            <>
              <div className="hidden md:flex items-center gap-4">
                <Link to="/signin">
                  <Button variant="ghost" className="hover:text-[#ff7f50]">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-[#ff7f50] hover:bg-[#ff6347]">Get Started</Button>
                </Link>
              </div>

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
                <Button className="w-full bg-[#ff7f50] hover:bg-[#ff6347]">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
