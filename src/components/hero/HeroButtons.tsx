
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart2 } from "lucide-react";
import { Link } from "react-router-dom";

const HeroButtons = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Link to="/signup">
        <Button size="lg" className="w-full sm:w-auto bg-[#ff7f50] hover:bg-[#ff6347] text-white transition-all duration-300">
          Start Your Journey
          <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.75} />
        </Button>
      </Link>
      <Link to="/about">
        <Button variant="outline" size="lg" className="w-full sm:w-auto border-[#ff7f50] text-[#ff7f50] hover:bg-[#ff7f50]/10 transition-all duration-300">
          <BarChart2 className="mr-2 h-4 w-4" strokeWidth={1.75} />
          Learn More
        </Button>
      </Link>
    </div>
  );
};

export default HeroButtons;
