
import React from "react";

type HeroDescriptionProps = {
  text: string;
};

const HeroDescription = ({ text }: HeroDescriptionProps) => {
  return (
    <p className="text-lg text-muted-foreground md:text-xl leading-relaxed max-w-[600px] mx-auto md:mx-0">
      {text}
    </p>
  );
};

export default HeroDescription;
