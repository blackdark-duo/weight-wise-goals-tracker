
import React from "react";
import Navbar from "@/components/Navbar";
import MobileNavigation from "@/components/MobileNavigation";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <div className="min-h-screen bg-ui-background">
      <Navbar />
      <main>
        <section className="py-16 md:py-24 bg-gradient-to-br from-white via-[#ff7f50]/10 to-[#ff6347]/10">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                About <span className="bg-gradient-to-r from-[#ff7f50] to-[#ff6347] bg-clip-text text-transparent">Weight Wise</span>
              </motion.h1>
              <motion.p 
                className="text-lg text-muted-foreground mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Empowering people to take control of their health journey through innovative tracking and personalized insights.
              </motion.p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container px-4 md:px-6">
            <motion.div
              className="max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6 text-[#ff7f50]">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                At Weight Wise, we believe that maintaining a healthy weight shouldn't be complicated. Our mission is to provide intuitive tools that make weight tracking simple, meaningful, and motivating.
              </p>
              <p className="text-lg text-muted-foreground">
                We combine cutting-edge technology with evidence-based health science to deliver personalized insights that help you achieve your goals and maintain a healthier lifestyle for the long term.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-[#ff7f50]/5 to-[#ff6347]/5">
          <div className="container px-4 md:px-6">
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4 text-[#ff7f50]">Our Approach</h2>
              <p className="text-lg text-muted-foreground">
                Weight Wise was founded with a simple premise: weight management should be about building healthy, sustainable habits—not quick fixes or extreme measures.
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-8">
              <motion.div 
                className="bg-white p-6 rounded-xl shadow-sm border border-[#ff7f50]/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-semibold mb-3 text-[#ff7f50]">Personal Insights</h3>
                <p className="text-muted-foreground">
                  Our platform uses AI to analyze your trends and provide meaningful insights that help you understand your body better. No generic advice—just personalized guidance based on your unique data.
                </p>
              </motion.div>

              <motion.div 
                className="bg-white p-6 rounded-xl shadow-sm border border-[#ff7f50]/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-semibold mb-3 text-[#ff7f50]">Goal-Oriented</h3>
                <p className="text-muted-foreground">
                  We help you set realistic, achievable goals and track your progress towards them. Our visualizations make it easy to see how far you've come and stay motivated on your journey.
                </p>
              </motion.div>

              <motion.div 
                className="bg-white p-6 rounded-xl shadow-sm border border-[#ff7f50]/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-semibold mb-3 text-[#ff7f50]">Privacy-First</h3>
                <p className="text-muted-foreground">
                  Your health data is personal. We prioritize your privacy and security, ensuring your information is protected and never shared without your explicit permission.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container px-4 md:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-3xl font-bold mb-6 text-[#ff7f50]">Join Us on This Journey</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Whether you're looking to lose weight, gain muscle, or simply maintain a healthier lifestyle, Weight Wise is here to support you every step of the way.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/signup" className="inline-block">
                  <Button className="px-6 py-3 bg-[#ff7f50] hover:bg-[#ff6347] text-white rounded-md font-medium transition-all">
                    Get Started Today
                  </Button>
                </Link>
                <Link to="/contact" className="inline-block">
                  <Button variant="outline" className="px-6 py-3 border-[#ff7f50] text-[#ff7f50] hover:bg-[#ff7f50]/10 rounded-md font-medium transition-all">
                    Contact Our Team
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <MobileNavigation />
    </div>
  );
};

export default About;
