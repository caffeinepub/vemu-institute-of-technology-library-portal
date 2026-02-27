import React from 'react';
import { Navigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../backend';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const { userRole, isRoleLoading } = useAuth();

  const isAuthenticated = !!identity;

  // Show spinner while II is initializing or role is being resolved
  if (isInitializing || (isAuthenticated && isRoleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading session…</p>
        </div>
      </div>
    );
  }

  // Not authenticated → send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Role-gated route: wait until role is resolved, then check
  if (requiredRole) {
    if (userRole !== requiredRole) {
      // Non-admin trying to access /admin → send to dashboard
      if (requiredRole === UserRole.admin) {
        return <Navigate to="/dashboard" />;
      }
      return <Navigate to="/login" />;
    }
  }

  return <>{children}</>;
}
