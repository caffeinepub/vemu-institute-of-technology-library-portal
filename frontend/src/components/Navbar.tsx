import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../backend';
import ThemeToggle from './ThemeToggle';
import { BookOpen, Menu, X, Shield, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Navbar() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { userRole, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isAdmin = userRole === UserRole.admin;

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const navLinks = isAuthenticated
    ? isAdmin
      ? [{ label: 'Dashboard', to: '/admin' }]
      : [{ label: 'Dashboard', to: '/dashboard' }]
    : [
        { label: 'Home', to: '/' },
        { label: 'Login', to: '/login' },
        { label: 'Sign Up', to: '/signup' },
      ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-foreground text-lg hidden sm:block">
              VEMU Library
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, to }) => (
              <button
                key={to}
                onClick={() => navigate({ to })}
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-2">
                {isAdmin && (
                  <Badge variant="default" className="gap-1">
                    <Shield className="w-3 h-3" />
                    Admin
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            )}

            {!isAuthenticated && (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/login' })}>
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate({ to: '/signup' })}>
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-3 flex flex-col gap-1">
            {navLinks.map(({ label, to }) => (
              <button
                key={to}
                onClick={() => {
                  navigate({ to });
                  setMobileOpen(false);
                }}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-left"
              >
                {label}
              </button>
            ))}
            {isAuthenticated && (
              <>
                {isAdmin && (
                  <div className="px-3 py-2">
                    <Badge variant="default" className="gap-1">
                      <Shield className="w-3 h-3" />
                      Admin
                    </Badge>
                  </div>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors text-left flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
