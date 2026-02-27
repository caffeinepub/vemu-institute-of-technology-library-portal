import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../backend';
import { BookOpen, UserPlus, CheckCircle, Shield, Users, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { setUserRole, userRole } = useAuth();

  const [isFetchingRole, setIsFetchingRole] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  const isLoggingIn = loginStatus === 'logging-in';
  const isAuthenticated = !!identity;

  // After login + actor ready → fetch role and redirect
  useEffect(() => {
    if (!isAuthenticated || actorFetching || !actor || isFetchingRole) return;

    setIsFetchingRole(true);
    actor.getUserRole()
      .then((role) => {
        const typedRole = role as UserRole;
        setUserRole(typedRole);
        if (typedRole === UserRole.admin) {
          navigate({ to: '/admin' });
        } else {
          navigate({ to: '/dashboard' });
        }
      })
      .catch((err) => {
        console.error('Failed to fetch role:', err);
        setSignupError('Failed to determine user role. Please try again.');
        setIsFetchingRole(false);
      });
  }, [isAuthenticated, actor, actorFetching]);

  // If already authenticated and role known, redirect immediately
  useEffect(() => {
    if (isAuthenticated && userRole && !isFetchingRole) {
      if (userRole === UserRole.admin) {
        navigate({ to: '/admin' });
      } else {
        navigate({ to: '/dashboard' });
      }
    }
  }, [isAuthenticated, userRole, isFetchingRole]);

  const handleSignUp = async () => {
    setSignupError(null);
    try {
      await login();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg !== 'User is already authenticated') {
        setSignupError('Sign up failed. Please try again.');
      }
    }
  };

  const buttonDisabled = isLoggingIn || isFetchingRole || isInitializing;
  const buttonText = isLoggingIn
    ? 'Connecting…'
    : isFetchingRole
    ? 'Loading profile…'
    : 'Create Account with Internet Identity';

  const steps = [
    {
      icon: Shield,
      title: 'Secure Identity',
      desc: 'Internet Identity creates a cryptographic key pair — no passwords needed.',
    },
    {
      icon: Users,
      title: 'Join the Library',
      desc: 'Your account is linked to your identity and grants access to all library resources.',
    },
    {
      icon: BookMarked,
      title: 'Start Borrowing',
      desc: 'Browse thousands of books and borrow up to 5 at a time for 14 days.',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-card border border-border rounded-2xl shadow-premium p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-foreground">VEMU Library</h1>
              <p className="text-xs text-muted-foreground">Digital Library System</p>
            </div>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-1">
              Create Your Account
            </h2>
            <p className="text-muted-foreground text-sm">
              Join VEMU's digital library with a secure, passwordless account.
            </p>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-3">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {signupError && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3">
              <p className="text-sm text-destructive">{signupError}</p>
            </div>
          )}

          <Button
            onClick={handleSignUp}
            disabled={buttonDisabled}
            className="w-full"
            size="lg"
          >
            {buttonDisabled && (
              <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
            )}
            <UserPlus className="w-4 h-4 mr-2" />
            {buttonText}
          </Button>

          <div className="flex items-center gap-2 justify-center">
            <CheckCircle className="w-4 h-4 text-success" />
            <p className="text-xs text-muted-foreground">
              Already have an account?{' '}
              <a href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
