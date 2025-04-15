
import React from "react";

type HeroDescriptionProps = {
  text: string;
};

const HeroDescription = ({ text }: HeroDescriptionProps) => {
  return (
    <p className="text-lg text-muted-foreground md:text-xl leading-relaxed">
      {text}
    </p>
  );
};

export default HeroDescription;
