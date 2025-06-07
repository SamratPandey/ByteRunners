import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-green-400 hover:text-green-300 mb-4">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="bg-gray-900/50 border-green-900 p-8">
          <div className="prose prose-green max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  By accessing and using ByteRunners, you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  ByteRunners is an online coding education platform that provides:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Interactive coding challenges and problems</li>
                  <li>Programming courses and tutorials</li>
                  <li>Code execution and testing environment</li>
                  <li>Progress tracking and achievements</li>
                  <li>Community features and leaderboards</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  To access certain features of our service, you must create an account. You agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Acceptable Use</h2>
              <div className="text-gray-300 space-y-4">
                <p>You agree not to use the service to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Upload, post, or transmit any harmful, threatening, or illegal content</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the service</li>
                  <li>Share your account credentials with others</li>
                  <li>Use automated tools to scrape or download content</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibent text-white mb-4">5. Content and Intellectual Property</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  All content on ByteRunners, including text, graphics, logos, and software, is the property of ByteRunners 
                  or its content suppliers and is protected by copyright and other intellectual property laws.
                </p>
                <p>
                  You retain ownership of any code you submit, but you grant us a license to use, store, and display your 
                  submissions for the purpose of providing our services.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Code Execution</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Our platform allows you to execute code in a sandboxed environment. You understand and agree that:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Code execution is subject to time and resource limits</li>
                  <li>We may monitor code execution for security and performance</li>
                  <li>Malicious code attempts will result in account suspension</li>
                  <li>We are not responsible for any issues arising from code execution</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Privacy</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, 
                  to understand our practices.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Termination</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We may terminate or suspend your account and access to the service at our sole discretion, without prior 
                  notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Disclaimer of Warranties</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  The service is provided "as is" without any warranties, expressed or implied. We do not warrant that the 
                  service will be uninterrupted, error-free, or completely secure.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">10. Limitation of Liability</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  In no event shall ByteRunners be liable for any indirect, incidental, special, consequential, or punitive 
                  damages arising out of your use of the service.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to Terms</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We reserve the right to modify these terms at any time. We will notify users of any material changes. 
                  Your continued use of the service after such modifications constitutes acceptance of the updated terms.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Information</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <ul className="space-y-2">
                  <li>Email: legal@byterunners.com</li>
                  <li>Address: ByteRunners Legal Team</li>
                </ul>
              </div>
            </section>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <Link to="/login">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
