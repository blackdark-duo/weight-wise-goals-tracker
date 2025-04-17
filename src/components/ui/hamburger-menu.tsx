
import * as React from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon?: React.ElementType;
}

interface HamburgerMenuProps {
  items: NavItem[];
  className?: string;
}

export function HamburgerMenu({ items, className }: HamburgerMenuProps) {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost"
          size="icon"
          className={cn("md:hidden", className)}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[250px] p-0">
        <div className="grid gap-2 py-6">
          <div className="px-4 flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-flow-row auto-rows-max gap-1 px-2">
            {items.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-gradient-to-r from-brand-primary/10 to-transparent text-brand-primary" 
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => setOpen(false)}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
