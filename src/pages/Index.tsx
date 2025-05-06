
import { Navbar } from "@/components/navigation";
import HeroSection from "@/components/HeroSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FeaturesSection from "@/components/FeaturesSection";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-ui-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        
        {/* CTA Section */}
        <section className="py-20 bg-[#ff7f50] text-white">
          <div className="container px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Ready to Start Your Weight Journey?
            </h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">
              Join thousands of happy customers who have transformed their lives with Weight Wise.
            </p>
            <Link to="/signup">
              <Button 
                size="lg"
                className="inline-flex h-12 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-[#ff7f50] shadow-lg transition-all hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:shadow-xl"
              >
                Get Started Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="border-t border-ui-border py-12 bg-white">
          <div className="container px-4">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
              <div>
                <h3 className="text-xl font-bold text-black mb-4">
                  Weight Wise
                </h3>
                <p className="mt-4 text-sm text-muted-foreground">
                  Your trusted partner for weightwiseing and goal setting.
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-4">Resources</h4>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <Link to="/about" className="text-muted-foreground hover:text-[#ff7f50] transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-muted-foreground hover:text-[#ff7f50] transition-colors">
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-4">Legal</h4>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <Link to="/privacy" className="text-muted-foreground hover:text-[#ff7f50] transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-muted-foreground hover:text-[#ff7f50] transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-4">Connect</h4>
                <div className="flex space-x-4">
                  <a href="#" className="text-muted-foreground hover:text-[#ff7f50] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-[#ff7f50] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-[#ff7f50] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  </a>
                </div>
              </div>
            </div>
            
            <div className="mt-12 border-t border-ui-border pt-8 text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Weight Wise. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
      <Toaster />
    </div>
  );
};

export default Index;
