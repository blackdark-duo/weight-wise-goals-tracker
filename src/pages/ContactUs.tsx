
import React from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import MobileNavigation from "@/components/MobileNavigation";
import { Toaster } from "@/components/ui/toaster";
import { motion } from "framer-motion";

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-ui-background">
      <Navbar />
      <main className="container px-4 py-16 md:py-24">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
          <p className="text-muted-foreground text-lg mb-12">
            Have questions or feedback? We're here to help! Reach out to our friendly team.
          </p>

          <div className="flex flex-col items-center p-8 rounded-lg bg-gradient-to-br from-white to-[#ff7f50]/5 shadow-sm border border-[#ff7f50]/10">
            <div className="h-16 w-16 rounded-full bg-[#ff7f50]/10 flex items-center justify-center mb-6">
              <Mail className="h-8 w-8 text-[#ff7f50]" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Email Us</h3>
            <p className="text-muted-foreground mb-4">For general inquiries and support</p>
            <a 
              href="mailto:support@cozyapp.uno" 
              className="inline-flex items-center justify-center px-6 py-3 bg-[#ff7f50] text-white rounded-md hover:bg-[#ff6347] transition-colors"
            >
              support@cozyapp.uno
            </a>
          </div>
          
          <p className="mt-12 text-muted-foreground">
            We value your feedback and aim to respond to all inquiries within 24 hours.
          </p>
        </motion.div>
      </main>
      <MobileNavigation />
      <Toaster />
    </div>
  );
};

export default ContactUs;
