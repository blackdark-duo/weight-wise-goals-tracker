
import { HeroSection } from "@/components/ui/hero-section";
import { Icons } from "@/components/ui/icons";
import Navbar from "@/components/Navbar";
import ComparisonTable from "@/components/ComparisonTable";
import MobileNavigation from "@/components/MobileNavigation";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30">
      <Navbar />
      <main>
        {/* New Hero Section */}
        <HeroSection
          badge={{
            text: "Now with AI-powered insights",
            action: {
              text: "Learn how",
              href: "/features",
            },
          }}
          title="Transform Your Weight Journey"
          description="WeightWise is your personal companion for a healthier, more vibrant lifestyle. Track your progress, get AI-powered insights, and achieve your wellness goals with precision and motivation."
          actions={[
            {
              text: "Start Your Journey",
              href: "/signup",
              variant: "default",
              icon: <Icons.scale className="h-5 w-5" />,
            },
            {
              text: "Explore Features",
              href: "/features",
              variant: "glow",
              icon: <Icons.chart className="h-5 w-5" />,
            },
          ]}
          image={{
            src: "/lovable-uploads/weight-wise-hero.png",
            alt: "WeightWise dashboard showcasing intuitive fitness tracking and wellness insights",
          }}
        />
        
        <ComparisonTable />
        
        {/* Vibrant CTA Section */}
        <section className="py-20 bg-gradient-to-r from-brand-primary/90 to-purple-600 text-white">
          <div className="container text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Ready to Start Your Weight Journey?
            </h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">
              Join thousands of happy customers who have transformed their lives with WeightWise.
            </p>
            <Button 
              size="lg"
              className="bg-white hover:bg-gray-100 text-brand-primary"
              asChild
            >
              <a href="/signup">Get Started Today</a>
            </Button>
          </div>
        </section>
        
        {/* Footer with enhanced styling */}
        <footer className="border-t border-ui-border py-12 bg-white">
          <div className="container">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent">
                  WeightWise
                </h3>
                <p className="mt-4 text-sm text-muted-foreground">
                  Your trusted partner for weight tracking and goal setting.
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-brand-primary">Product</h4>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <a href="/features" className="text-muted-foreground hover:text-brand-primary transition-colors">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="/pricing" className="text-muted-foreground hover:text-brand-primary transition-colors">
                      Pricing
                    </a>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-brand-primary">Resources</h4>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <a href="/blog" className="text-muted-foreground hover:text-brand-primary transition-colors">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="/faq" className="text-muted-foreground hover:text-brand-primary transition-colors">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-brand-primary">Legal</h4>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <a href="/privacy" className="text-muted-foreground hover:text-brand-primary transition-colors">
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className="text-muted-foreground hover:text-brand-primary transition-colors">
                      Terms
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 border-t border-ui-border pt-8 text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} WeightWise. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
      <MobileNavigation />
      <Toaster />
    </div>
  );
};

export default Index;
