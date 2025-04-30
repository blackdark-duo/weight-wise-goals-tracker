
import React from "react";
import { cn } from "@/lib/utils";

type HeroDescriptionProps = {
  text: string;
  className?: string;
};

const HeroDescription = ({ text, className }: HeroDescriptionProps) => {
  return (
    <p className={cn(
      "text-lg text-muted-foreground md:text-xl leading-relaxed max-w-[650px] animate-fade-in",
      className
    )}>
      {text}
    </p>
  );
};

export default HeroDescription;
