
import React from "react";
import Navbar from "@/components/Navbar";
import MobileNavigation from "@/components/MobileNavigation";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-ui-background">
      <Navbar />
      <main className="container px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: April 30, 2025</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
              <p>
                Welcome to Weight Wise. By accessing our website and using our services, you agree to be bound by these Terms of Service and our Privacy Policy. If you disagree with any part of the terms, you may not access our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Use License</h2>
              <p className="mb-4">
                Permission is granted to temporarily access the materials on Weight Wise's website for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to decompile or reverse engineer any software contained on Weight Wise's website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Account Creation</h2>
              <p className="mb-4">
                To use certain features of our service, you must create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>
              <p>
                You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. We encourage you to use "strong" passwords (passwords that use a combination of upper and lower case letters, numbers, and symbols) with your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">User Content</h2>
              <p className="mb-4">
                Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content you post, including its legality, reliability, and appropriateness.
              </p>
              <p>
                By posting content, you grant us the right to use, modify, publicly perform, publicly display, reproduce, and distribute such content on and through our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Disclaimer</h2>
              <p>
                The materials on Weight Wise's website are provided on an 'as is' basis. Weight Wise makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Limitations</h2>
              <p>
                In no event shall Weight Wise or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Weight Wise's website, even if Weight Wise or a Weight Wise authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
              <p>
                Weight Wise reserves the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at <a href="mailto:legal@Weight Wise.com" className="text-purple-600 hover:underline">legal@Weight Wise.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <MobileNavigation />
    </div>
  );
};

export default TermsOfService;
