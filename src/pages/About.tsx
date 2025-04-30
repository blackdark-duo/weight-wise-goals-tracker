
import React from "react";
import Navbar from "@/components/Navbar";
import MobileNavigation from "@/components/MobileNavigation";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="min-h-screen bg-ui-background">
      <Navbar />
      <main>
        <section className="py-16 md:py-24 bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                About <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Weight Wise</span>
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
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-lg text-muted-foreground mb-4">
                  At Weight Wise, we believe that maintaining a healthy weight shouldn't be complicated. Our mission is to provide intuitive tools that make weight tracking simple, meaningful, and motivating.
                </p>
                <p className="text-lg text-muted-foreground">
                  We combine cutting-edge technology with evidence-based health science to deliver personalized insights that help you achieve your goals and maintain a healthier lifestyle for the long term.
                </p>
              </motion.div>
              <motion.div
                className="rounded-xl overflow-hidden shadow-lg"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <img 
                  src="/lovable-uploads/weight-wise-hero.png"
                  alt="Weight Wise team working together" 
                  className="w-full h-auto"
                />
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-purple-50 to-indigo-50">
          <div className="container px-4 md:px-6">
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">Our Story</h2>
              <p className="text-lg text-muted-foreground">
                Weight Wise was founded in 2023 by a team of health professionals and technology experts who recognized the need for a more effective and user-friendly approach to weight management.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div 
                className="bg-white p-6 rounded-xl shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-semibold mb-3">The Beginning</h3>
                <p className="text-muted-foreground">
                  Our journey began when our founders experienced firsthand the challenges of tracking weight and maintaining healthy habits consistently. They envisioned a solution that would make the process simpler and more meaningful.
                </p>
              </motion.div>

              <motion.div 
                className="bg-white p-6 rounded-xl shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-semibold mb-3">Innovation</h3>
                <p className="text-muted-foreground">
                  By integrating AI technology with evidence-based health science, we developed a platform that provides personalized insights and recommendations tailored to each user's unique journey.
                </p>
              </motion.div>

              <motion.div 
                className="bg-white p-6 rounded-xl shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-semibold mb-3">Today</h3>
                <p className="text-muted-foreground">
                  Today, Weight Wise serves thousands of users worldwide, helping them achieve their health goals through smart tracking, meaningful insights, and supportive community features.
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
              <h2 className="text-3xl font-bold mb-6">Join Us on This Journey</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Whether you're looking to lose weight, gain muscle, or simply maintain a healthier lifestyle, Weight Wise is here to support you every step of the way.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="/signup" className="inline-block">
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md font-medium hover:from-purple-700 hover:to-indigo-700 transition-all">
                    Get Started Today
                  </button>
                </a>
                <a href="/contact" className="inline-block">
                  <button className="px-6 py-3 bg-white border border-purple-300 text-purple-700 rounded-md font-medium hover:bg-purple-50 transition-all">
                    Contact Our Team
                  </button>
                </a>
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
