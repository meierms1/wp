import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  EnvelopeIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import {
  FaLinkedin,
  FaGithub,
  FaFacebook,
  FaInstagram,
  FaOrcid,
  FaGoogle
} from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubscribing(true);
    try {
      const response = await axios.post('/api/newsletter/subscribe', {
        email: email.trim()
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setEmail(''); // Clear the input
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to subscribe. Please try again later.');
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Resume', href: '/resume' },
    { name: 'Projects', href: '/projects' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'FIRE Quiz', href: '/quiz' },
  ];

  const tools = [
    { name: 'Login', href: '/login' },
    { name: 'Register', href: '/register' },
    { name: 'Calculator', href: '/tools' },
    { name: 'Finance Tools', href: '/finance' },
  ];

  const socialLinks = [
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/in/maycon-meier/',
      icon: FaLinkedin,
      color: 'hover:text-blue-400',
    },
    {
      name: 'GitHub',
      href: 'https://www.github.com/meierms1',
      icon: FaGithub,
      color: 'hover:text-gray-400',
    },
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/maycon.meier/',
      icon: FaFacebook,
      color: 'hover:text-blue-500',
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/sshmyinsta',
      icon: FaInstagram,
      color: 'hover:text-pink-400',
    },
    {
      name: 'ORCID',
      href: 'https://orcid.org/0000-0001-9914-8811',
      icon: FaOrcid,
      color: 'hover:text-green-400',
    },
    {
      name: 'Google Scholar',
      href: 'https://scholar.google.com/citations?user=DsWpAHMAAAAJ&hl=en&oi=ao',
      icon: FaGoogle,
      color: 'hover:text-red-400',
    },
  ];

  const researchLinks = [
    {
      name: 'Solids Group',
      href: 'https://www.solids.group',
    },
    {
      name: 'Alamo Documentation',
      href: 'https://alamo.readthedocs.io/en/latest/index.html',
    },
  ];

  return (
    <footer className="relative mt-20">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-secondary-900 to-accent-900 opacity-95" />
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="container-custom py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* About Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center"
                >
                  <RocketLaunchIcon className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-white font-display">Maycon Meier</h3>
                  <p className="text-white/70 text-sm">PhD • Developer • Researcher</p>
                </div>
              </div>
              
              <p className="text-white/80 mb-6 leading-relaxed">
                Passionate about economy, computational mechanics, software development, and innovative solutions. 
                Building the future through code and research.
              </p>

              {/* Newsletter Signup */}
              <div className="space-y-3">
                <h4 className="text-white font-semibold">Stay Updated</h4>
                <form onSubmit={handleNewsletterSubmit} className="flex">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-l-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={isSubscribing}
                  />
                  <button 
                    type="submit"
                    disabled={isSubscribing}
                    className="px-4 py-2 bg-accent-600 hover:bg-accent-700 disabled:bg-accent-700/50 text-white rounded-r-lg transition-colors flex items-center justify-center"
                  >
                    {isSubscribing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <EnvelopeIcon className="w-5 h-5" />
                    )}
                  </button>
                </form>
                <p className="text-white/60 text-sm">Get notified about new projects and publications.</p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6 font-display">Navigation</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-white/80 hover:text-white transition-colors hover:translate-x-1 transform inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools & Account */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6 font-display">Tools & Account</h4>
              <ul className="space-y-3">
                {tools.map((tool) => (
                  <li key={tool.name}>
                    <Link
                      to={tool.href}
                      className="text-white/80 hover:text-white transition-colors hover:translate-x-1 transform inline-block"
                    >
                      {tool.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect & Research */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6 font-display">Connect</h4>
              
              {/* Social Media Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      className={`p-3 bg-white/10 rounded-lg border border-white/20 text-white/80 ${social.color} transition-all duration-200 flex items-center justify-center hover:bg-white/20`}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.a>
                  );
                })}
              </div>

              {/* Research Links */}
              <div>
                <h5 className="text-white/80 font-medium mb-3">Research & Publications</h5>
                <div className="space-y-2">
                  {researchLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white/80 hover:text-white text-sm transition-all duration-200 hover:translate-x-1 transform"
                    >
                      {link.name} →
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="container-custom py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-white/60 text-sm mb-4 md:mb-0">
                © {currentYear} Maycon Meier. Built with React & Flask. All rights reserved.
              </p>
              
              <div className="flex items-center space-x-6 text-sm text-white/60">
                <span>Made with ❤️ in Phoenix, AZ</span>
                <span>•</span>
                <span>Fluent in English, Portuguese & Spanish</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
