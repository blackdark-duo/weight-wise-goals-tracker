
import React from "react";
import { motion } from "framer-motion";
import { BarChart2, Target, Activity, Heart, BrainCircuit, Shield, Webhook } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/Footer";

type FeatureProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

const Feature = ({ title, description, icon }: FeatureProps) => {
  return (
    <motion.div 
      className="flex flex-col items-center text-center p-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#ff7f50] to-[#ff6347] flex items-center justify-center mb-5">
        <div className="text-white">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
};

const DetailFeature = ({ title, description, icon, reversed = false }) => {
  return (
    <motion.div 
      className={`flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'} gap-10 items-center py-16`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
    >
      <div className="w-full md:w-1/2">
        <div className={`h-64 rounded-xl ${reversed ? 'bg-gradient-to-bl' : 'bg-gradient-to-br'} from-[#ff7f50]/10 to-[#ff6347]/20 flex items-center justify-center`}>
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#ff7f50] to-[#ff6347] flex items-center justify-center">
            <div className="text-white">
              {icon}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">{title}</h2>
        <p className="text-lg text-muted-foreground mb-6">{description}</p>
        <Button asChild>
          <Link to="/signup">Try It Now</Link>
        </Button>
      </div>
    </motion.div>
  );
};

const Features = () => {
  const features = [
    {
      title: "Weight Tracking",
      description: "Easy and intuitive weight tracking with visual charts to monitor your progress over time.",
      icon: <BarChart2 className="h-6 w-6" />
    },
    {
      title: "Goal Setting",
      description: "Set personalized weight goals and track your progress with customizable timelines.",
      icon: <Target className="h-6 w-6" />
    },
    {
      title: "Activity Logging",
      description: "Record your physical activities and see how they impact your weight loss journey.",
      icon: <Activity className="h-6 w-6" />
    },
    {
      title: "Health Metrics",
      description: "Track important health metrics beyond weight for a complete wellness picture.",
      icon: <Heart className="h-6 w-6" />
    },
    {
      title: "AI Insights",
      description: "Get personalized recommendations and insights powered by advanced AI analysis.",
      icon: <BrainCircuit className="h-6 w-6" />
    },
    {
      title: "Data Privacy",
      description: "Your health data is always secure with our robust privacy protections.",
      icon: <Shield className="h-6 w-6" />
    }
  ];

  const detailFeatures = [
    {
      title: "AI-Powered Weight Insights",
      description: "Our advanced AI analyzes your weight data to identify trends, patterns, and opportunities for improvement. Get personalized recommendations tailored to your unique weight journey.",
      icon: <BrainCircuit className="h-12 w-12" />
    },
    {
      title: "Powerful API Integrations",
      description: "Connect WeightWise with your favorite fitness apps and devices through our webhook integration system. Seamlessly sync your data across your entire health ecosystem.",
      icon: <Webhook className="h-12 w-12" />
    },
    {
      title: "Comprehensive Weight Charts",
      description: "Visualize your weight journey with beautiful, interactive charts that help you understand your progress and keep you motivated toward reaching your goals.",
      icon: <BarChart2 className="h-12 w-12" />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Powerful Features for Your 
              <span className="bg-gradient-to-r from-[#ff7f50] to-[#ff6347] bg-clip-text text-transparent"> Weight Journey</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              WeightWise provides all the tools you need to succeed on your weight management journey.
            </p>
          </div>
          
          <div className="grid gap-y-10 gap-x-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Feature 
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4">
          {detailFeatures.map((feature, index) => (
            <DetailFeature
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              reversed={index % 2 === 1}
            />
          ))}
        </div>
      </section>
      
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Weight Management?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of satisfied users who have improved their health journey with WeightWise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-to-r from-[#ff7f50] to-[#ff6347]">
                <Link to="/signup">Get Started for Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Features;
