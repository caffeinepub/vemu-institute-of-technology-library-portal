import React, { useEffect } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { BookOpen, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerRole } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn, identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { isFetching: actorFetching } = useActor();
  const { data: role, isFetched: roleFetched } = useGetCallerRole();

  useEffect(() => {
    if (isAuthenticated && !actorFetching && roleFetched && role) {
      if (role === 'admin') {
        navigate({ to: '/admin' });
      } else {
        navigate({ to: '/dashboard' });
      }
    }
  }, [isAuthenticated, actorFetching, roleFetched, role, navigate]);

  const handleSignUp = () => {
    try {
      login();
    } catch (err) {
      console.error('Sign up error:', err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card-premium p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-navy flex items-center justify-center shadow-premium">
                <UserPlus className="w-8 h-8 text-gold" />
              </div>
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Join VEMU Library</h1>
            <p className="text-muted-foreground text-sm mt-1">Create your account to access the library</p>
          </div>

          {/* Steps */}
          <div className="space-y-3 mb-6">
            {[
              { step: '1', text: 'Click "Create Account" below' },
              { step: '2', text: 'Authenticate with Internet Identity' },
              { step: '3', text: 'Set up your profile name and email' },
              { step: '4', text: 'Start browsing and borrowing books!' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-navy text-warm-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {step}
                </div>
                <span className="text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={handleSignUp}
            disabled={isLoggingIn || isInitializing}
            className="w-full bg-gold text-navy hover:bg-gold-light font-semibold h-11 gap-2"
          >
            {isLoggingIn ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</>
            ) : (
              <><UserPlus className="w-4 h-4" /> Create Account</>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-navy dark:text-gold font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          VEMU Institute of Technology Library Portal
        </p>
      </div>
    </div>
  );
}
