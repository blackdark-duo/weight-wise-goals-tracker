
import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

type TestimonialProps = {
  quote: string;
  name: string;
  title: string;
  rating: number;
};

const Testimonial = ({ quote, name, title, rating }: TestimonialProps) => {
  return (
    <motion.div 
      className="flex flex-col p-6 bg-white rounded-xl shadow-sm border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="mb-4 flex">
        {Array(5).fill(0).map((_, i) => (
          <Star 
            key={i} 
            className={`h-5 w-5 ${i < rating ? "text-yellow-400" : "text-gray-200"}`} 
            fill={i < rating ? "currentColor" : "none"} 
          />
        ))}
      </div>
      <div className="flex-1">
        <Quote className="h-6 w-6 text-purple-300 mb-2" />
        <p className="text-gray-600 italic mb-4">{quote}</p>
      </div>
      <div>
        <p className="font-bold">{name}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </motion.div>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "Weight Wise helped me lose 15 pounds in just 2 months! The AI insights were incredibly helpful for adjusting my routine.",
      name: "Sarah Johnson",
      title: "Fitness Enthusiast",
      rating: 5
    },
    {
      quote: "The personalized recommendations were spot on. I've never felt better about my health journey.",
      name: "Michael Chen",
      title: "Tech Professional",
      rating: 5
    },
    {
      quote: "I love how easy it is to track my progress and see real results. The visualization tools are amazing!",
      name: "Emma Rodriguez",
      title: "Teacher",
      rating: 4
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-purple-50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied users who have transformed their health journey with Weight Wise.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Testimonial 
              key={index}
              quote={testimonial.quote}
              name={testimonial.name}
              title={testimonial.title}
              rating={testimonial.rating}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
