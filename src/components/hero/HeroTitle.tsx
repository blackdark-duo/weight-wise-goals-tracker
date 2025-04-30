
import React from "react";

type HeroTitleProps = {
  highlight: string;
  beforeText: string;
  afterText: string;
};

const HeroTitle = ({ highlight, beforeText, afterText }: HeroTitleProps) => {
  return (
    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl leading-tight">
      {beforeText}{" "}
      <span className="bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent font-extrabold">
        {highlight}
      </span>{" "}
      {afterText}
    </h1>
  );
};

export default HeroTitle;
