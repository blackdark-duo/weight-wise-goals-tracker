
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ComparisonTable from "@/components/ComparisonTable";

const Index = () => {
  return (
    <div className="min-h-screen bg-ui-background">
      <Navbar />
      <main>
        <HeroSection />
        
        <ComparisonTable />
        
        {/* CTA Section */}
        <section className="py-20 bg-brand-primary text-white">
          <div className="container text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Ready to Start Your Weight Journey?
            </h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">
              Join thousands of happy customers who have transformed their lives with WeightWise.
            </p>
            <a 
              href="/signup" 
              className="inline-flex h-12 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-brand-primary shadow-lg transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Get Started Today
            </a>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="border-t border-ui-border py-12 bg-white">
          <div className="container">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
              <div>
                <h3 className="text-xl font-bold">
                  <span className="text-brand-primary">Weight</span>
                  <span className="text-brand-secondary">Wise</span>
                </h3>
                <p className="mt-4 text-sm text-muted-foreground">
                  Your trusted partner for weight tracking and goal setting.
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold">Product</h4>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <a href="/features" className="text-muted-foreground hover:text-brand-primary">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="/pricing" className="text-muted-foreground hover:text-brand-primary">
                      Pricing
                    </a>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold">Resources</h4>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <a href="/blog" className="text-muted-foreground hover:text-brand-primary">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="/faq" className="text-muted-foreground hover:text-brand-primary">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold">Legal</h4>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <a href="/privacy" className="text-muted-foreground hover:text-brand-primary">
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className="text-muted-foreground hover:text-brand-primary">
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
    </div>
  );
};

export default Index;
