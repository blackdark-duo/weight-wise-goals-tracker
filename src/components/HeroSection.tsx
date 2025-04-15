
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Star } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-ui-background py-20 md:py-28">
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight">
              Transform Your{" "}
              <span className="text-brand-primary">Weight Loss</span>{" "}
              Journey with Precision
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl leading-relaxed">
              WeightWise is your comprehensive, user-friendly platform designed to help you track, 
              understand, and achieve your weight management goals with scientific accuracy and personalized insights.
            </p>
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
            
            <motion.div 
              className="flex items-center gap-2 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex">
                {[1, 2, 3, 4].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < 4 ? "text-yellow-400" : "text-muted"}`} fill={i < 4 ? "currentColor" : "none"} />
                ))}
                <Star className="h-5 w-5 text-muted" />
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                <span className="font-medium">1000+ Happy Customers</span>
              </div>
            </motion.div>
          </div>
          
          {/* Hero Image */}
          <motion.div 
            className="relative mx-auto w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 p-4">
              <img
                src="/lovable-uploads/f9e9f46c-9dea-4df5-96a3-cc6bc8d960e1.png"
                alt="Weight Wise App Dashboard"
                className="h-full w-full rounded-lg object-cover shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
