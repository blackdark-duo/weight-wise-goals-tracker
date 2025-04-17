
import { Link, useLocation } from "react-router-dom";
import { Home, Target, BarChart2, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: Home },
    { title: "Goals", href: "/goals", icon: Target },
    { title: "Reports", href: "/reports", icon: BarChart2 },
    { title: "Account", href: "/account", icon: UserCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-ui-border md:hidden shadow-lg">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.title}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center",
                isActive 
                  ? "text-brand-primary" 
                  : "text-muted-foreground hover:text-foreground",
                isActive && "after:content-[''] after:w-1/2 after:h-1 after:bg-brand-primary after:absolute after:bottom-0 after:rounded-t-full after:transition-all"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-brand-primary")} />
              <span className="text-xs mt-1">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;
