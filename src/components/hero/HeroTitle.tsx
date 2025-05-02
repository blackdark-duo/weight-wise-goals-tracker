
import React from "react";
import TextRotate from "../ui/text-rotate";

type HeroTitleProps = {
  highlight: string;
  beforeText: string;
  afterText: string;
};

const HeroTitle = ({ highlight, beforeText, afterText }: HeroTitleProps) => {
  return (
    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl leading-tight">
      {beforeText}{" "}
      <span className="bg-gradient-to-r from-[#ff7f50] to-[#ff6347] bg-clip-text text-transparent font-extrabold">
        {highlight}
      </span>{" "}
      {afterText} <br />
      <TextRotate 
        items={["Track", "Analyze", "Improve", "Achieve"]} 
        className="text-[#ff7f50]" 
      />
    </h1>
  );
};

export default HeroTitle;
