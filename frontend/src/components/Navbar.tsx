import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Menu, X, BookOpen, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerRole, useGetCallerUserProfile } from '../hooks/useQueries';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;

  const { data: role } = useGetCallerRole();
  const { data: profile } = useGetCallerUserProfile();

  const isAdmin = role === 'admin';

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setMobileOpen(false);
    navigate({ to: '/' });
  };

  const navLinks = (
    <>
      <Link
        to="/"
        className="text-sm font-medium hover:text-gold transition-colors duration-200"
        onClick={() => setMobileOpen(false)}
      >
        Home
      </Link>
      {isAuthenticated && !isAdmin && (
        <Link
          to="/dashboard"
          className="text-sm font-medium hover:text-gold transition-colors duration-200 flex items-center gap-1.5"
          onClick={() => setMobileOpen(false)}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Link>
      )}
      {isAuthenticated && isAdmin && (
        <Link
          to="/admin"
          className="text-sm font-medium hover:text-gold transition-colors duration-200 flex items-center gap-1.5"
          onClick={() => setMobileOpen(false)}
        >
          <Shield className="w-4 h-4" />
          Admin
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-navy/95 backdrop-blur-sm text-warm-white shadow-premium">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/assets/generated/library-logo.dim_128x128.png"
            alt="VEMU Library Logo"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-gold/40 group-hover:ring-gold transition-all duration-200"
          />
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-gold/80 leading-none">VEMU Institute of Technology</p>
            <p className="text-sm font-heading font-semibold leading-tight">Library Portal</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {profile && (
                <span className="text-sm text-warm-white/70">
                  {profile.name}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-warm-white/80 hover:text-warm-white hover:bg-white/10 gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/login' })}
                className="text-warm-white/80 hover:text-warm-white hover:bg-white/10"
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => navigate({ to: '/signup' })}
                className="bg-gold text-navy hover:bg-gold-light font-semibold"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>

        {/* Mobile: Theme + Hamburger */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-warm-white hover:bg-white/10"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-navy/98 backdrop-blur-sm">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navLinks}
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  {profile && (
                    <p className="text-sm text-warm-white/60 px-1">Signed in as {profile.name}</p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="justify-start text-warm-white/80 hover:text-warm-white hover:bg-white/10 gap-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { navigate({ to: '/login' }); setMobileOpen(false); }}
                    className="justify-start text-warm-white/80 hover:text-warm-white hover:bg-white/10"
                  >
                    Login
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => { navigate({ to: '/signup' }); setMobileOpen(false); }}
                    className="bg-gold text-navy hover:bg-gold-light font-semibold justify-start"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
