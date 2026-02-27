import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { UserRole } from '../backend';

interface AuthContextValue {
  userRole: UserRole | null;
  isRoleLoading: boolean;
  /** Alias for isRoleLoading — kept for backward compatibility */
  isLoading: boolean;
  setUserRole: (role: UserRole | null) => void;
  persistedPrincipal: string | null;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  userRole: null,
  isRoleLoading: true,
  isLoading: true,
  setUserRole: () => {},
  persistedPrincipal: null,
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const ROLE_KEY = 'userRole';
const PRINCIPAL_KEY = 'persistedPrincipal';

function getStoredRole(): UserRole | null {
  try {
    const stored = localStorage.getItem(ROLE_KEY);
    if (stored === UserRole.admin || stored === UserRole.user || stored === UserRole.guest) {
      return stored as UserRole;
    }
  } catch {
    // ignore
  }
  return null;
}

function getStoredPrincipal(): string | null {
  try {
    return localStorage.getItem(PRINCIPAL_KEY);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { identity, clear } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const [userRole, setUserRoleState] = useState<UserRole | null>(getStoredRole);
  const [persistedPrincipal, setPersistedPrincipal] = useState<string | null>(getStoredPrincipal);
  const [isRoleLoading, setIsRoleLoading] = useState<boolean>(true);

  const setUserRole = useCallback((role: UserRole | null) => {
    setUserRoleState(role);
    if (role !== null) {
      try { localStorage.setItem(ROLE_KEY, role); } catch { /* ignore */ }
    } else {
      try { localStorage.removeItem(ROLE_KEY); } catch { /* ignore */ }
    }
  }, []);

  const logout = useCallback(async () => {
    try { localStorage.removeItem(ROLE_KEY); } catch { /* ignore */ }
    try { localStorage.removeItem(PRINCIPAL_KEY); } catch { /* ignore */ }
    setUserRoleState(null);
    setPersistedPrincipal(null);
    await clear();
  }, [clear]);

  // When identity changes, fetch role from backend
  useEffect(() => {
    if (!identity) {
      setIsRoleLoading(false);
      return;
    }

    const principal = identity.getPrincipal().toString();
    setPersistedPrincipal(principal);
    try { localStorage.setItem(PRINCIPAL_KEY, principal); } catch { /* ignore */ }

    if (actorFetching || !actor) {
      setIsRoleLoading(true);
      return;
    }

    setIsRoleLoading(true);
    actor.getUserRole()
      .then((role) => {
        setUserRole(role as UserRole);
        setIsRoleLoading(false);
      })
      .catch(() => {
        const stored = getStoredRole();
        if (stored) setUserRoleState(stored);
        setIsRoleLoading(false);
      });
  }, [identity, actor, actorFetching, setUserRole]);

  // If no identity, ensure loading is false
  useEffect(() => {
    if (!identity && !actorFetching) {
      setIsRoleLoading(false);
    }
  }, [identity, actorFetching]);

  return (
    <AuthContext.Provider
      value={{
        userRole,
        isRoleLoading,
        isLoading: isRoleLoading,
        setUserRole,
        persistedPrincipal,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
