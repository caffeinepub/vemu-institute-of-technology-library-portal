import React, { useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../backend';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor();
  const { userRole, isRoleLoading, isAdminPasswordLogin } = useAuth();

  // Guard to prevent multiple redirects
  const hasRedirectedRef = useRef(false);

  // Determine if the user is authenticated
  const isAuthenticated = isAdminPasswordLogin || !!identity;

  // For admin password login, we don't need to wait for actor or II initialization.
  // For II login, we need to wait for all three to resolve.
  const isStillLoading = isAdminPasswordLogin
    ? isRoleLoading  // admin pw login only needs role loading to finish
    : isInitializing || actorFetching || isRoleLoading;

  // Determine if the user has the required role
  const hasRequiredRole = !requiredRole || userRole === requiredRole;

  useEffect(() => {
    // Don't redirect while still loading
    if (isStillLoading) return;

    // Don't redirect multiple times
    if (hasRedirectedRef.current) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      hasRedirectedRef.current = true;
      navigate({ to: '/login' });
      return;
    }

    // If authenticated but wrong role, redirect to appropriate page
    if (isAuthenticated && !hasRequiredRole) {
      hasRedirectedRef.current = true;
      if (userRole === UserRole.admin) {
        navigate({ to: '/admin' });
      } else {
        navigate({ to: '/dashboard' });
      }
    }
  }, [isStillLoading, isAuthenticated, hasRequiredRole, userRole, navigate]);

  // Reset redirect guard when auth state changes (e.g., after logout)
  useEffect(() => {
    if (!isAuthenticated && !isStillLoading) {
      hasRedirectedRef.current = false;
    }
  }, [isAuthenticated, isStillLoading]);

  // Show loading spinner while auth state is resolving
  if (isStillLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  // Not authenticated — render nothing while redirect fires
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated but wrong role — render nothing while redirect fires
  if (!hasRequiredRole) {
    return null;
  }

  // All checks passed — render children
  return <>{children}</>;
}
