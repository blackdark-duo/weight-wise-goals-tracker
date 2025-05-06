
import React from "react";
import { motion } from "framer-motion";
import { BarChart2, Target, Activity, Heart, Brain, Shield } from "lucide-react";

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
      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-5">
        <div className="text-white">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
};

const FeaturesSection = () => {
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
      icon: <Brain className="h-6 w-6" />
    },
    {
      title: "Data Privacy",
      description: "Your health data is always secure with our robust privacy protections.",
      icon: <Shield className="h-6 w-6" />
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Weight Wise provides all the tools you need to succeed on your weight management journey.
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
  );
};

export default FeaturesSection;
