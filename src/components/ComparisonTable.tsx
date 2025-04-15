
import { Check, X } from "lucide-react";

const ComparisonTable = () => {
  const features = [
    { name: "Weight Tracking", competitors: true, us: true },
    { name: "Goal Setting", competitors: true, us: true },
    { name: "Email Verification", competitors: false, us: true },
    { name: "Personalized Dashboard", competitors: true, us: true },
    { name: "Progress Visualization", competitors: true, us: true },
    { name: "Custom Goal Types", competitors: false, us: true },
    { name: "Milestone Tracking", competitors: false, us: true },
    { name: "Account Data Control", competitors: false, us: true },
    { name: "Privacy Focus", competitors: false, us: true },
    { name: "Free Basic Plan", competitors: false, us: true },
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
            See how we compare to other weight tracking applications in the market
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
                  <td className="p-4 border-b border-ui-border font-medium">{feature.name}</td>
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
            Ready to experience the difference?
          </p>
          <a 
            href="/signup" 
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Start Your Journey Today
          </a>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;
