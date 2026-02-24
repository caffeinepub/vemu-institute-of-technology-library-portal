import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { BookOpen, Users, BookMarked, Clock, Search, Shield, Star, ArrowRight, GraduationCap, Library, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedCounter from '../components/AnimatedCounter';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

const features = [
  {
    icon: Search,
    title: 'Smart Book Search',
    description: 'Find any book instantly with our powerful search and filter system across thousands of titles.',
  },
  {
    icon: BookMarked,
    title: 'Easy Borrowing',
    description: 'Borrow books with a single click and manage your reading list from your personal dashboard.',
  },
  {
    icon: Clock,
    title: 'Due Date Tracking',
    description: 'Never miss a return date with clear due date displays and your borrowing history.',
  },
  {
    icon: Shield,
    title: 'Secure Access',
    description: 'Role-based access control ensures students and administrators have the right permissions.',
  },
  {
    icon: GraduationCap,
    title: 'Academic Focus',
    description: 'Curated collection of academic texts, research papers, and reference materials.',
  },
  {
    icon: Award,
    title: 'Premium Experience',
    description: 'A modern, intuitive interface designed for the VEMU academic community.',
  },
];

const staticStats = [
  { label: 'Books Available', value: 5000, icon: BookOpen },
  { label: 'Registered Users', value: 1200, icon: Users },
  { label: 'Books Borrowed', value: 340, icon: BookMarked },
  { label: 'Categories', value: 48, icon: Library },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative min-h-[640px] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url('/assets/generated/hero-bg.dim_1440x600.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-navy/80 dark:bg-navy/90" />

        {/* Decorative gold top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent z-20" />

        <div className="relative z-20 container mx-auto px-4 text-center text-warm-white py-20">

          {/* ── VEMU INSTITUTE OF TECHNOLOGY — dominant hero heading ── */}
          <div className="mb-6">
            <h1
              className="font-heading font-extrabold leading-none tracking-wide uppercase"
              style={{
                fontSize: 'clamp(2.2rem, 6vw, 5rem)',
                color: 'transparent',
                WebkitTextStroke: '1px oklch(0.82 0.18 85)',
                backgroundImage:
                  'linear-gradient(135deg, oklch(0.88 0.20 88) 0%, oklch(0.75 0.22 78) 50%, oklch(0.88 0.20 88) 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                textShadow: '0 4px 32px oklch(0.75 0.22 78 / 0.45)',
                letterSpacing: '0.06em',
              }}
            >
              VEMU INSTITUTE
            </h1>
            <h1
              className="font-heading font-extrabold leading-none tracking-wide uppercase"
              style={{
                fontSize: 'clamp(2.2rem, 6vw, 5rem)',
                color: 'transparent',
                WebkitTextStroke: '1px oklch(0.82 0.18 85)',
                backgroundImage:
                  'linear-gradient(135deg, oklch(0.88 0.20 88) 0%, oklch(0.75 0.22 78) 50%, oklch(0.88 0.20 88) 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                textShadow: '0 4px 32px oklch(0.75 0.22 78 / 0.45)',
                letterSpacing: '0.06em',
              }}
            >
              OF TECHNOLOGY
            </h1>
            {/* Gold accent underline */}
            <div className="mt-3 mx-auto w-32 h-1 rounded-full bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gold/20 border border-gold/30 rounded-full px-4 py-1.5 mb-6 text-gold text-sm font-medium">
            <Star className="w-3.5 h-3.5 fill-gold" />
            Digital Library Portal
          </div>

          {/* Sub-heading */}
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight text-warm-white">
            Your Gateway to
            <span className="block text-gold">Academic Excellence</span>
          </h2>

          <p className="text-base sm:text-lg text-warm-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
            Access thousands of books, manage your borrowings, and explore our curated academic collection — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Button
                size="lg"
                onClick={() => navigate({ to: '/dashboard' })}
                className="bg-gold text-navy hover:bg-gold-light font-semibold text-base px-8 gap-2"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => navigate({ to: '/signup' })}
                  className="bg-gold text-navy hover:bg-gold-light font-semibold text-base px-8 gap-2"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate({ to: '/login' })}
                  className="border-warm-white/40 text-warm-white hover:bg-white/10 hover:border-warm-white/60 text-base px-8"
                >
                  Login
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Decorative gold bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent z-20" />
      </section>

      {/* Stats Bar */}
      <section className="bg-navy dark:bg-navy/80 py-10 border-y border-gold/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {staticStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center text-warm-white">
                  <div className="flex justify-center mb-2">
                    <Icon className="w-6 h-6 text-gold" />
                  </div>
                  <div className="text-3xl font-heading font-bold text-gold">
                    <AnimatedCounter target={stat.value} />+
                  </div>
                  <p className="text-sm text-warm-white/60 mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A comprehensive library management system built for the VEMU academic community.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="card-premium p-6 group"
                >
                  <div className="w-12 h-12 rounded-lg bg-navy/10 dark:bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-navy/20 dark:group-hover:bg-gold/20 transition-colors duration-200">
                    <Icon className="w-6 h-6 text-navy dark:text-gold" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-navy dark:bg-navy/60">
        <div className="container mx-auto px-4 text-center text-warm-white">
          <h2 className="font-heading text-3xl font-bold mb-4">
            Ready to Start Reading?
          </h2>
          <p className="text-warm-white/70 mb-8 max-w-lg mx-auto">
            Join the VEMU Library Portal today and unlock access to our entire academic collection.
          </p>
          {!isAuthenticated && (
            <Button
              size="lg"
              onClick={() => navigate({ to: '/signup' })}
              className="bg-gold text-navy hover:bg-gold-light font-semibold text-base px-10 gap-2"
            >
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
