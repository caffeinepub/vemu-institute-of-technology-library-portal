import React from 'react';
import { BookOpen, Heart } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'vemu-library-portal');

  return (
    <footer className="bg-navy text-warm-white/80 border-t border-white/10">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/generated/library-logo.dim_128x128.png"
                alt="VEMU Library"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-gold/40"
              />
              <div>
                <p className="text-xs text-gold/80">VEMU Institute of Technology</p>
                <p className="text-sm font-heading font-semibold text-warm-white">Library Portal</p>
              </div>
            </div>
            <p className="text-xs text-warm-white/50 leading-relaxed">
              Empowering students and faculty with seamless access to knowledge and academic resources.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gold">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-gold transition-colors">Home</Link></li>
              <li><Link to="/login" className="hover:text-gold transition-colors">Login</Link></li>
              <li><Link to="/signup" className="hover:text-gold transition-colors">Sign Up</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gold">Contact</h4>
            <div className="text-xs space-y-1 text-warm-white/50">
              <p>VEMU Institute of Technology</p>
              <p>Chittoor, Andhra Pradesh</p>
              <p>India - 517 112</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-warm-white/40">
          <p>© {year} VEMU Institute of Technology. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-gold fill-gold" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
