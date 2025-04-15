
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroButtons = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Link to="/signup">
        <Button size="lg" className="w-full sm:w-auto">
          Start Your Journey
        </Button>
      </Link>
      <Link to="/features">
        <Button size="lg" variant="outline" className="w-full sm:w-auto">
          Learn More
        </Button>
      </Link>
    </div>
  );
};

export default HeroButtons;
