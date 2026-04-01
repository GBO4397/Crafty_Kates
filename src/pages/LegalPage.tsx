import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Scale } from 'lucide-react';
import Navigation from '@/components/crafty/Navigation';
import Footer from '@/components/crafty/Footer';

const LEGAL_CONTENT: Record<string, { title: string; icon: React.ReactNode; content: React.ReactNode }> = {
  'privacy-policy': {
    title: 'Privacy Policy',
    icon: <Shield size={24} className="text-white" />,
    content: (
      <div className="space-y-6">
        <p className="text-gray-600 leading-relaxed">Last updated: March 29, 2026</p>
        <div>
          <h3 className="font-heading text-xl text-gray-900 mb-3">1. Information We Collect</h3>
          <p className="text-gray-600 leading-relaxed mb-2">We collect information you provide directly to us, such as when you:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
            <li>Fill out our contact form (name, email, message)</li>
            <li>Register for the Classic Burger Car Show</li>
            <li>Subscribe to our newsletter</li>
            <li>Submit community events or posts</li>
            <li>Submit coloring book creations</li>
          </ul>
        </div>
        <div>
          <h3 className="font-heading text-xl text-gray-900 mb-3">2. How We Use Your Information</h3>
          <p className="text-gray-600 leading-relaxed">We use the information we collect to:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
            <li>Process car show registrations and event submissions</li>
            <li>Respond to your inquiries and contact form submissions</li>
            <li>Send newsletters and event updates (with your consent)</li>
            <li>Improve our website and community services</li>
            <li>Communicate about upcoming events and community activities</li>
          </ul>
        </div>
        <div>
          <h3 className="font-heading text-xl text-gray-900 mb-3">3. Information Sharing</h3>
          <p className="text-gray-600 leading-relaxed">We do not sell, trade, or rent your personal information to third parties. We may share information with trusted service providers who assist us in operating our website, provided they agree to keep this information confidential.</p>
        </div>
        <div>
          <h3 className="font-heading text-xl text-gray-900 mb-3">4. Data Security</h3>
          <p className="text-gray-600 leading-relaxed">We implement reasonable security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>
        </div>
        <div>
          <h3 className="font-heading text-xl text-gray-900 mb-3">5. Cookies</h3>
          <p className="text-gray-600 leading-relaxed">Our website may use cookies to enhance your browsing experience. You can choose to disable cookies through your browser settings, though this may affect some website functionality.</p>
        </div>
        <div>
          <h3 className="font-heading text-xl text-gray-900 mb-3">6. Contact Us</h3>
          <p className="text-gray-600 leading-relaxed">If you have questions about this Privacy Policy, please contact us at <a href="mailto:craftykates@mail.com" className="text-[#9E065D] hover:text-[#FB50B1]">craftykates@mail.com</a> or call <a href="tel:17604131559" className="text-[#9E065D] hover:text-[#FB50B1]">1 (760) 413-1559</a>.</p>
        </div>
      </div>
    ),
  },
  'disclaimer': {
    title: 'Disclaimer',
    icon: <FileText size={24} className="text-white" />,
    content: (
      <div className="space-y-6">
        <p className="text-gray-600 leading-relaxed">Last updated: March 29, 2026</p>
        <div>
          <h3 className="font-heading text-xl text-gray-900 mb-3">General Disclaimer</h3>
          <p className="text-gray-600 leading-relaxed">The information provided on the Crafty Kates website is for general informational purposes only. While we strive to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the website or the information, products, services, or related graphics contained on the website.</p>
        </div>
        <div>
          <h3 className="font-heading text-xl text-gray-900 mb-3">Event Information</h3>
          <p className="text-gray-600 leading-relaxed">Event dates, times, locations, and details are subject to change without notice. We recommend confirming event details before attending. Crafty Kate Promotions is not responsible for changes made by third-party event organizers.</p>
        </div>
        <div>
          <h3 className="font-heading text-xl text-gray-900 mb-3">Community Submissions</h3>
          <p className="text-gray-600 leading-relaxed">Community-submitted events, posts, and coloring books represent the views of their respective authors and do not necessarily reflect the views of Crafty Kate Promotions. All submissions are reviewed before publishing, but we do not guarantee the accuracy of community-submitted content.</p>
        </div>
        <div>
          <h3 className="font-heading text-xl text-gray-900 mb-3">External Links</h3>
          <p className="text-gray-600 leading-relaxed">Our website may contain links to external websites. We have no control over the content and nature of these sites and are not responsible for their content or privacy practices.</p>
        </div>
        <div>
          <h3 className="font-heading text-xl text-gray-900 mb-3">Limitation of Liability</h3>
          <p className="text-gray-600 leading-relaxed">In no event shall Crafty Kate Promotions be liable for any loss or damage including without limitation, indirect or consequential loss or damage, arising from the use of this website.</p>
        </div>
      </div>
    ),
  },
  'terms-of-use': {
    title: 'Terms of Use',
    icon: <Scale size={24} className="text-white" />,
    content: (
      <div className="space-y-6">
        <p className="text-gray-600 leading-relaxed">Last updated: March 29, 2026</p>
        <div>
          <h3 className="font-heading text-xl text-gray-900 mb-3">1. Acceptance of Terms</h3>
          <p className="text-gray-600 leading-relaxed">By accessing and using the Crafty Kates website, you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our website.</p>
        </div>
        <div>
          <h3 className="font-heading text-xl text-gray-900 mb-3">2. Use of Website</h3>
          <p className="text-gray-600 leading-relaxed">You may use our website for lawful purposes only. You agree not to:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
            <li>Use the website in any way that violates applicable laws or regulations</li>
            <li>Submit false or misleading information</li>
            <li>Attempt to interfere with the proper functioning of the website</li>
            <li>Copy, reproduce, or distribute content without permission</li>
          </ul>
        </div>
        <div>
          <h3 className="font-heading text-xl text-gray-900 mb-3">3. User Submissions</h3>
          <p className="text-gray-600 leading-relaxed">When you submit content (events, posts, coloring books), you grant Crafty Kate Promotions a non-exclusive, royalty-free license to use, display, and distribute that content on our website and social media channels. You represent that you have the right to submit such content.</p>
        </div>
        <div>
          <h3 className="font-heading text-xl text-gray-900 mb-3">4. Intellectual Property</h3>
          <p className="text-gray-600 leading-relaxed">All content on this website, including text, graphics, logos, images, and software, is the property of Crafty Kate Promotions or its content suppliers and is protected by intellectual property laws. Photography credits belong to their respective photographers.</p>
        </div>
        <div>
          <h3 className="font-heading text-xl text-gray-900 mb-3">5. Car Show Registration</h3>
          <p className="text-gray-600 leading-relaxed">Registration for the Classic Burger Car Show is subject to availability and additional terms provided during the registration process. Crafty Kate Promotions reserves the right to refuse or cancel registrations at its discretion.</p>
        </div>
        <div>
          <h3 className="font-heading text-xl text-gray-900 mb-3">6. Changes to Terms</h3>
          <p className="text-gray-600 leading-relaxed">We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting on the website. Your continued use of the website constitutes acceptance of the modified terms.</p>
        </div>
        <div>
          <h3 className="font-heading text-xl text-gray-900 mb-3">7. Contact</h3>
          <p className="text-gray-600 leading-relaxed">For questions about these Terms of Use, contact us at <a href="mailto:craftykates@mail.com" className="text-[#9E065D] hover:text-[#FB50B1]">craftykates@mail.com</a>.</p>
        </div>
      </div>
    ),
  },
};

const LegalPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const page = LEGAL_CONTENT[type || ''];

  if (!page) {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-900">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Page not found</h1>
          <Link to="/" className="text-[#9E065D] hover:text-[#FB50B1]">Return to Home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      <Navigation />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1a0a12] via-[#2d1020] to-[#1a0a12] py-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FB50B1]/10 rounded-full blur-[120px]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm mb-6">
            <Link to="/" className="text-white/40 hover:text-[#FB50B1] transition-colors">Home</Link>
            <span className="text-white/20">/</span>
            <span className="text-[#FB50B1]">{page.title}</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-2xl flex items-center justify-center">
              {page.icon}
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl text-white tracking-wider">{page.title.toUpperCase()}</h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12">
            {page.content}
          </div>

          <div className="mt-8">
            <Link to="/" className="inline-flex items-center gap-2 text-[#9E065D] hover:text-[#FB50B1] font-medium transition-colors">
              <ArrowLeft size={18} />
              Back to Crafty Kates
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LegalPage;
