import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../backend';
import { BookOpen, LogIn, Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Hardcoded admin credentials (client-side only)
const ADMIN_EMAIL = 'patannoormahammad123@gmail.com';
const ADMIN_PASSWORD = 'makiya@2005';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity, isInitializing } = useInternetIdentity();
  const { setUserRole, userRole, setAdminPasswordLogin, isAdminPasswordLogin, isRoleLoading } = useAuth();

  const [loginError, setLoginError] = useState<string | null>(null);

  // Email/password form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordLoggingIn, setIsPasswordLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'password' | 'identity'>('password');

  // Guard to prevent multiple navigations
  const hasNavigatedRef = useRef(false);

  const isLoggingIn = loginStatus === 'logging-in';

  // ── Single redirect effect ────────────────────────────────────────────────
  useEffect(() => {
    // Don't navigate multiple times
    if (hasNavigatedRef.current) return;

    // Admin password login: role is already set synchronously, isRoleLoading is false
    if (isAdminPasswordLogin && userRole === UserRole.admin && !isRoleLoading) {
      hasNavigatedRef.current = true;
      setIsPasswordLoggingIn(false);
      navigate({ to: '/admin' });
      return;
    }

    // Internet Identity login: wait until role is fully resolved (not loading)
    if (identity && userRole && !isRoleLoading) {
      hasNavigatedRef.current = true;
      if (userRole === UserRole.admin) {
        navigate({ to: '/admin' });
      } else {
        navigate({ to: '/dashboard' });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminPasswordLogin, userRole, isRoleLoading, identity]);

  // Reset navigation guard when identity/login state is cleared
  useEffect(() => {
    if (!identity && !isAdminPasswordLogin) {
      hasNavigatedRef.current = false;
    }
  }, [identity, isAdminPasswordLogin]);

  const handleIILogin = async () => {
    setLoginError(null);
    hasNavigatedRef.current = false;
    try {
      await login();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg !== 'User is already authenticated') {
        setLoginError('Login failed. Please try again.');
      }
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsPasswordLoggingIn(true);
    hasNavigatedRef.current = false;

    // Brief async delay to allow UI to update before processing
    await new Promise<void>((resolve) => setTimeout(resolve, 100));

    if (
      email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
      password === ADMIN_PASSWORD
    ) {
      // Set role first, then flag.
      // setAdminPasswordLogin also calls setIsRoleLoading(false) internally,
      // so the redirect effect will fire immediately on the next render.
      setUserRole(UserRole.admin);
      setAdminPasswordLogin(true);
      // Navigation is handled by the redirect useEffect above.
      // isPasswordLoggingIn will be reset in the redirect effect.
    } else {
      setLoginError('Invalid email or password. Please check your credentials and try again.');
      setIsPasswordLoggingIn(false);
    }
  };

  const iiButtonDisabled = isLoggingIn || isInitializing || isRoleLoading;
  const iiButtonText = isLoggingIn
    ? 'Connecting…'
    : isRoleLoading && identity
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

          {/* Tab switcher */}
          <div className="w-full flex rounded-xl overflow-hidden border border-border">
            <button
              type="button"
              onClick={() => { setActiveTab('password'); setLoginError(null); }}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'password'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'
              }`}
            >
              Admin Login
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('identity'); setLoginError(null); }}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'identity'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'
              }`}
            >
              Internet Identity
            </button>
          </div>

          {/* Error message */}
          {loginError && (
            <div className="w-full bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3">
              <p className="text-sm text-destructive">{loginError}</p>
            </div>
          )}

          {/* Admin Email/Password Form */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordLogin} className="w-full flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="admin-email" className="text-sm font-medium text-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="admin-password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPasswordLoggingIn}
                className="w-full mt-1"
                size="lg"
              >
                {isPasswordLoggingIn ? (
                  <>
                    <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In as Admin
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Internet Identity Login */}
          {activeTab === 'identity' && (
            <div className="w-full flex flex-col gap-4">
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

              <Button
                onClick={handleIILogin}
                disabled={iiButtonDisabled}
                className="w-full"
                size="lg"
              >
                {iiButtonDisabled && (
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                )}
                <LogIn className="w-4 h-4 mr-2" />
                {iiButtonText}
              </Button>
            </div>
          )}

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
