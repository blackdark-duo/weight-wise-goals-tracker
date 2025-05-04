
import React from "react";
import Navbar from "@/components/Navbar";
import MobileNavigation from "@/components/MobileNavigation";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-ui-background">
      <Navbar />
      <main className="container px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: April 30, 2025</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
              <p className="mb-4">
                Weight Wise ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>
              <p>
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
              <p className="mb-4">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personal information (name, email address, etc.) when you create an account</li>
                <li>Health and fitness data you input into our platform</li>
                <li>Information about your device and how you interact with our services</li>
                <li>Communications you have with us</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
              <p className="mb-4">We may use the information we collect for various purposes, including to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process and complete transactions</li>
                <li>Send you technical notices, updates, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Develop new products and services</li>
                <li>Generate anonymized, aggregate data for research purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Information Sharing and Disclosure</h2>
              <p className="mb-4">We may share your information in the following situations:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>With your consent or at your direction</li>
                <li>With vendors and service providers who need access to such information to carry out work on our behalf</li>
                <li>In response to a request for information if we believe disclosure is in accordance with any applicable law, regulation, or legal process</li>
                <li>If we believe your actions are inconsistent with our user agreements or policies, or to protect the rights, property, and safety of Weight Wise or others</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
              <p>
                We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no internet or email transmission is ever fully secure or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
              <p className="mb-4">
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access to your personal data</li>
                <li>Correction of inaccurate or incomplete information</li>
                <li>Deletion of your personal data</li>
                <li>Restriction or objection to our use of your data</li>
                <li>Portability of your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "last updated" date at the top of this page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p>
                If you have any questions about this privacy policy, please contact us at <a href="mailto:privacy@Weight Wise.com" className="text-purple-600 hover:underline">privacy@Weight Wise.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <MobileNavigation />
    </div>
  );
};

export default PrivacyPolicy;
