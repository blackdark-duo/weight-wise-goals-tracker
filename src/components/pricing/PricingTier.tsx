
import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export interface PricingTierProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  notIncluded?: string[];
  buttonText: string;
  highlighted?: boolean;
  onClick: () => void;
  loading?: boolean;
}

export const PricingTier: React.FC<PricingTierProps> = ({
  title,
  price,
  description,
  features,
  notIncluded = [],
  buttonText,
  highlighted = false,
  onClick,
  loading = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Card 
        className={`h-full flex flex-col ${
          highlighted 
            ? "border-[#ff7f50] shadow-lg shadow-[#ff7f50]/10" 
            : "border-border"
        }`}
      >
        {highlighted && (
          <div className="h-1.5 bg-gradient-to-r from-[#ff7f50] to-[#ff6347] rounded-t-lg" />
        )}
        <CardHeader>
          <CardTitle className={`text-2xl ${highlighted ? "text-[#ff7f50]" : ""}`}>
            {title}
          </CardTitle>
          <div className="mt-2">
            <span className="text-3xl font-bold">{price}</span>
            {price !== "Free" && <span className="text-muted-foreground ml-1">/month</span>}
          </div>
          <p className="text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent className="flex-grow">
          <ul className="space-y-3">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
            {notIncluded.map((feature, i) => (
              <li key={`not-${i}`} className="flex items-start text-muted-foreground">
                <X className="h-5 w-5 text-red-400 mr-2 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={onClick}
            className={`w-full ${
              highlighted 
                ? "bg-[#ff7f50] hover:bg-[#ff6347] text-white" 
                : ""
            }`} 
            variant={highlighted ? "default" : "outline"}
            disabled={loading}
          >
            {loading && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            )}
            {buttonText}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
