
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { NavItem } from "./types";
import { NavItems } from "./NavItems";
import { MobileMenu } from "./MobileMenu";
import { NavLogo } from "./NavLogo";
import { HamburgerMenu } from "@/components/ui/hamburger-menu";
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
  
  const navLinks: NavItem[] = [
    { title: "Home", href: "/", icon: Home },
    { title: "Features", href: "/features", icon: Target },
    { title: "Pricing", href: "/pricing", icon: BarChart2 },
    { title: "About", href: "/about", icon: UserCircle }
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const authenticatedLinks: NavItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: Home },
    { title: "Goals", href: "/goals", icon: Target },
    { title: "Reports", href: "/reports", icon: BarChart2 },
    { title: "Account", href: "/account", icon: UserCircle },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ui-border bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <NavLogo session={session} />

        {!session && (
          <NavItems navLinks={navLinks} />
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
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-[#ff7f50] hover:bg-orange-600">Get Started</Button>
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
        <MobileMenu isOpen={isMenuOpen} navLinks={navLinks} setIsMenuOpen={setIsMenuOpen} />
      )}
    </header>
  );
};

export default Navbar;
