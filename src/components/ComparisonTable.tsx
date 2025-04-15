
import { Check, X } from "lucide-react";

const ComparisonTable = () => {
  const features = [
    { 
      name: "Comprehensive Weight Tracking", 
      description: "Detailed logging of weight, body measurements, and progress photos",
      competitors: false, 
      us: true 
    },
    { 
      name: "Intelligent Goal Setting", 
      description: "AI-powered personalized weight loss and fitness goals",
      competitors: false, 
      us: true 
    },
    { 
      name: "No Hidden Costs", 
      description: "100% free basic tier with no ads or subscriptions", 
      competitors: false, 
      us: true 
    },
    { 
      name: "Privacy-First Approach", 
      description: "End-to-end encryption and strict data protection", 
      competitors: false, 
      us: true 
    },
    { 
      name: "Advanced Analytics", 
      description: "Trend analysis, predictive insights, and progress visualization", 
      competitors: false, 
      us: true 
    },
    { 
      name: "Multi-Platform Support", 
      description: "Seamless experience across web, mobile, and desktop", 
      competitors: true, 
      us: true 
    },
    { 
      name: "Custom Progress Milestones", 
      description: "Create and track personalized achievement markers", 
      competitors: false, 
      us: true 
    },
    { 
      name: "Community Support", 
      description: "Optional anonymous peer motivation and tips", 
      competitors: false, 
      us: true 
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Why Choose <span className="text-brand-primary">Weight</span>
            <span className="text-brand-secondary">Wise</span>?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            We're not just another weight tracking app. We're your comprehensive health companion.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 border-b-2 border-ui-border">Features</th>
                <th className="p-4 border-b-2 border-ui-border text-center">Competitors</th>
                <th className="p-4 border-b-2 border-ui-border text-center bg-brand-primary/5">
                  <span className="font-bold">
                    <span className="text-brand-primary">Weight</span>
                    <span className="text-brand-secondary">Wise</span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr 
                  key={index} 
                  className={index % 2 === 0 ? "bg-ui-background" : "bg-white"}
                >
                  <td className="p-4 border-b border-ui-border">
                    <div className="font-medium">{feature.name}</div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </td>
                  <td className="p-4 border-b border-ui-border text-center">
                    {feature.competitors ? (
                      <Check className="inline h-5 w-5 text-goal-progress" />
                    ) : (
                      <X className="inline h-5 w-5 text-goal-missed" />
                    )}
                  </td>
                  <td className="p-4 border-b border-ui-border text-center bg-brand-primary/5">
                    {feature.us ? (
                      <Check className="inline h-5 w-5 text-goal-progress" />
                    ) : (
                      <X className="inline h-5 w-5 text-goal-missed" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg font-medium mb-6">
            Your health journey starts here - completely free, completely yours.
          </p>
          <a 
            href="/signup" 
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Start Your Transformation Today
          </a>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;
