import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
  /** True when the user logged in via the hardcoded admin email/password */
  isAdminPasswordLogin: boolean;
  setAdminPasswordLogin: (value: boolean) => void;
}

export const AuthContext = createContext<AuthContextValue>({
  userRole: null,
  isRoleLoading: true,
  isLoading: true,
  setUserRole: () => {},
  persistedPrincipal: null,
  logout: () => {},
  isAdminPasswordLogin: false,
  setAdminPasswordLogin: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const ROLE_KEY = 'userRole';
const PRINCIPAL_KEY = 'persistedPrincipal';
const ADMIN_PW_LOGIN_KEY = 'adminPasswordLogin';

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

function getStoredAdminPasswordLogin(): boolean {
  try {
    return localStorage.getItem(ADMIN_PW_LOGIN_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Compute the initial isRoleLoading value.
 * If admin password login is already persisted, we already know the role — no loading needed.
 * Otherwise start as true so we wait for the backend role fetch.
 */
function getInitialRoleLoading(): boolean {
  const isAdminPwLogin = getStoredAdminPasswordLogin();
  if (isAdminPwLogin) return false;
  // If there's no principal stored, we're not logged in — no loading needed
  const principal = getStoredPrincipal();
  if (!principal) return false;
  // There's a principal but we need to fetch the role from backend
  return true;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { identity, clear } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const [userRole, setUserRoleState] = useState<UserRole | null>(getStoredRole);
  const [persistedPrincipal, setPersistedPrincipal] = useState<string | null>(getStoredPrincipal);
  const [isRoleLoading, setIsRoleLoading] = useState<boolean>(getInitialRoleLoading);
  const [isAdminPasswordLogin, setAdminPasswordLoginState] = useState<boolean>(
    getStoredAdminPasswordLogin
  );

  // Stable principal string — only recomputed when identity changes
  const principalStr = useMemo(
    () => (identity ? identity.getPrincipal().toString() : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [identity]
  );

  // Track which principal we've already fetched a role for — prevents duplicate calls
  const fetchedForPrincipalRef = useRef<string | null>(null);
  // Track whether a role fetch is currently in-flight
  const isFetchingRoleRef = useRef(false);

  const setUserRole = useCallback((role: UserRole | null) => {
    setUserRoleState(role);
    if (role !== null) {
      try { localStorage.setItem(ROLE_KEY, role); } catch { /* ignore */ }
    } else {
      try { localStorage.removeItem(ROLE_KEY); } catch { /* ignore */ }
    }
  }, []);

  const setAdminPasswordLogin = useCallback((value: boolean) => {
    setAdminPasswordLoginState(value);
    try {
      if (value) {
        localStorage.setItem(ADMIN_PW_LOGIN_KEY, 'true');
      } else {
        localStorage.removeItem(ADMIN_PW_LOGIN_KEY);
      }
    } catch { /* ignore */ }
    // When setting admin password login, immediately mark role loading as done
    if (value) {
      setIsRoleLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try { localStorage.removeItem(ROLE_KEY); } catch { /* ignore */ }
    try { localStorage.removeItem(PRINCIPAL_KEY); } catch { /* ignore */ }
    try { localStorage.removeItem(ADMIN_PW_LOGIN_KEY); } catch { /* ignore */ }
    fetchedForPrincipalRef.current = null;
    isFetchingRoleRef.current = false;
    setUserRoleState(null);
    setPersistedPrincipal(null);
    setAdminPasswordLoginState(false);
    setIsRoleLoading(false);
    await clear();
  }, [clear]);

  // Resolve role from backend when identity + actor are ready.
  // Uses stable principalStr (memoized) to avoid re-triggering on identity object reference changes.
  useEffect(() => {
    // Admin password login path: role is set directly by LoginPage, nothing to do here.
    if (isAdminPasswordLogin) {
      setIsRoleLoading(false);
      return;
    }

    // No identity → not logged in via II
    if (!principalStr) {
      setIsRoleLoading(false);
      return;
    }

    // Persist principal
    setPersistedPrincipal(principalStr);
    try { localStorage.setItem(PRINCIPAL_KEY, principalStr); } catch { /* ignore */ }

    // Actor not ready yet — keep loading
    if (actorFetching || !actor) {
      setIsRoleLoading(true);
      return;
    }

    // Already fetched for this principal, or a fetch is in-flight — skip
    if (fetchedForPrincipalRef.current === principalStr || isFetchingRoleRef.current) {
      return;
    }

    // Mark as in-flight
    isFetchingRoleRef.current = true;
    fetchedForPrincipalRef.current = principalStr;
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
      })
      .finally(() => {
        isFetchingRoleRef.current = false;
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [principalStr, actor, actorFetching, isAdminPasswordLogin]);

  // When identity is cleared (logout), reset the fetched-principal tracker
  useEffect(() => {
    if (!principalStr) {
      fetchedForPrincipalRef.current = null;
      isFetchingRoleRef.current = false;
    }
  }, [principalStr]);

  const value = useMemo<AuthContextValue>(
    () => ({
      userRole,
      isRoleLoading,
      isLoading: isRoleLoading,
      setUserRole,
      persistedPrincipal,
      logout,
      isAdminPasswordLogin,
      setAdminPasswordLogin,
    }),
    [userRole, isRoleLoading, setUserRole, persistedPrincipal, logout, isAdminPasswordLogin, setAdminPasswordLogin]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
