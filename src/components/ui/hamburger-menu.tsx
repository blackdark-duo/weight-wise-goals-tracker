
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
  onClick?: () => void;
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
          className={cn(className)}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] p-0 border-l border-ui-border backdrop-blur-md bg-white/90">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-ui-border">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          </div>
          
          <div className="flex-1 overflow-auto py-6">
            <div className="grid grid-flow-row auto-rows-max gap-2 px-2">
              {items.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                
                const handleClick = () => {
                  setOpen(false);
                  item.onClick?.();
                };
                
                return item.onClick ? (
                  <Button
                    key={item.title}
                    variant="ghost"
                    className={cn(
                      "flex justify-start items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive && "bg-gradient-to-r from-brand-primary/10 to-transparent text-brand-primary"
                    )}
                    onClick={handleClick}
                  >
                    {Icon && <Icon className="h-4 w-4" strokeWidth={1.75} />}
                    {item.title}
                  </Button>
                ) : (
                  <Link
                    key={item.title}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-gradient-to-r from-brand-primary/10 to-transparent text-brand-primary" 
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {Icon && <Icon className="h-4 w-4" strokeWidth={1.75} />}
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="p-4 border-t border-ui-border">
            <p className="text-xs text-muted-foreground text-center">
              WeightWise © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
