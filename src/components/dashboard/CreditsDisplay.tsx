import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/auth";
import { toast } from "sonner";

interface CreditsDisplayProps {
  credits?: number;
  onCreditsUpdate?: (credits: number) => void;
}

const CreditsDisplay = ({ credits: initialCredits, onCreditsUpdate }: CreditsDisplayProps) => {
  const { session } = useAuth();
  const [credits, setCredits] = useState(initialCredits || 0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialCredits !== undefined) {
      setCredits(initialCredits);
    }
  }, [initialCredits]);

  const handleUpgradeClick = async () => {
    if (!session?.user) {
      toast.error("Please sign in to upgrade your plan");
      return;
    }

    setIsLoading(true);
    try {
      // Track upgrade interest
      const { data, error } = await supabase.rpc('track_upgrade_interest', {
        user_id_param: session.user.id,
        email_param: session.user.email || ''
      });

      if (error) {
        console.error('Error tracking upgrade interest:', error);
        toast.error("Failed to track upgrade interest");
      } else {
        toast.success("Interest registered! We'll contact you soon about upgrade options.");
      }
    } catch (error) {
      console.error('Error tracking upgrade interest:', error);
      toast.error("Failed to track upgrade interest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">Credits</span>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {credits}
            </Badge>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleUpgradeClick}
            disabled={isLoading}
            className="gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/30"
          >
            <CreditCard className="h-4 w-4" />
            {isLoading ? "Registering..." : "Upgrade Plan"}
          </Button>
        </div>
        
        <div className="mt-2">
          <p className="text-xs text-muted-foreground">
            Credits are used for AI insights and advanced features
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditsDisplay;