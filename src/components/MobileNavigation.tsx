
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-ui-border shadow-lg md:block">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.title}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center transition-all duration-200 relative",
                isActive 
                  ? "text-blue-600" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon 
                className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isActive ? "text-blue-600 scale-110" : ""
                )} 
                strokeWidth={1.75}
              />
              <span className="text-xs mt-1 font-medium">{item.title}</span>
              {isActive && (
                <span className="absolute bottom-0 w-1/2 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-full"></span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;
