import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../backend';
import { BookOpen, LogIn, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { setUserRole, userRole } = useAuth();

  const [isFetchingRole, setIsFetchingRole] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

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
        setLoginError('Failed to determine user role. Please try again.');
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

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await login();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg !== 'User is already authenticated') {
        setLoginError('Login failed. Please try again.');
      }
    }
  };

  const buttonDisabled = isLoggingIn || isFetchingRole || isInitializing;
  const buttonText = isLoggingIn
    ? 'Connecting…'
    : isFetchingRole
    ? 'Loading profile…'
    : 'Login with Internet Identity';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-premium p-8 flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-foreground">VEMU Library</h1>
              <p className="text-xs text-muted-foreground">Digital Library System</p>
            </div>
          </div>

          <div className="text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-1">Welcome Back</h2>
            <p className="text-muted-foreground text-sm">
              Sign in to access your library account
            </p>
          </div>

          {/* Admin badge */}
          <div className="w-full bg-muted/50 rounded-xl p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Secure Authentication</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Uses Internet Identity for passwordless, cryptographic login. Your identity is
                private and secure.
              </p>
            </div>
          </div>

          {loginError && (
            <div className="w-full bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3">
              <p className="text-sm text-destructive">{loginError}</p>
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={buttonDisabled}
            className="w-full"
            size="lg"
          >
            {buttonDisabled && (
              <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
            )}
            <LogIn className="w-4 h-4 mr-2" />
            {buttonText}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            New to VEMU Library?{' '}
            <a href="/signup" className="text-primary hover:underline font-medium">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
