
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted/50 py-12 border-t">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">Weight Wise</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
              <li><Link to="/features" className="text-muted-foreground hover:text-foreground">Features</Link></li>
              <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Account</h3>
            <ul className="space-y-2">
              <li><Link to="/signin" className="text-muted-foreground hover:text-foreground">Sign In</Link></li>
              <li><Link to="/signup" className="text-muted-foreground hover:text-foreground">Sign Up</Link></li>
              <li><Link to="/forgot-password" className="text-muted-foreground hover:text-foreground">Forgot Password</Link></li>
              <li><Link to="/account" className="text-muted-foreground hover:text-foreground">My Account</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact Us</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground">Help & FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <img 
              src="/lovable-uploads/app_logo.png" 
              alt="Weight Wise Logo" 
              className="h-8 w-8 mr-2" 
            />
            <span className="text-lg font-bold">Weight Wise</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Weight Wise. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
