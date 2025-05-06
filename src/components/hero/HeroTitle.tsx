
import React from "react";

type HeroTitleProps = {
  highlight: string;
  beforeText: string;
  afterText: string;
};

const HeroTitle = ({ highlight, beforeText, afterText }: HeroTitleProps) => {
  return (
    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight">
      {beforeText}{" "}
      <span className="text-brand-primary">{highlight}</span>{" "}
      {afterText}
    </h1>
  );
};

export default HeroTitle;
