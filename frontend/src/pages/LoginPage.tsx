import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, ChevronDown } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerRole } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';

const ROLES = [
  'Administrator',
  'Librarian',
  'Faculty Member',
  'Student Representative',
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn, identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { isFetching: actorFetching } = useActor();
  const { data: role, isFetched: roleFetched } = useGetCallerRole();

  const [selectedRole, setSelectedRole] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [batchYear, setBatchYear] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !actorFetching && roleFetched && role) {
      if (role === 'admin') {
        navigate({ to: '/admin' });
      } else {
        navigate({ to: '/dashboard' });
      }
    }
  }, [isAuthenticated, actorFetching, roleFetched, role, navigate]);

  const handleLogin = () => {
    try {
      login();
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#FFD700',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 16px',
    width: '100%',
    fontSize: '15px',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: '#FFD700',
    fontWeight: '700',
    fontSize: '12px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: '6px',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        backgroundImage: 'url(/assets/generated/hero-bg.dim_1440x600.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#1a0e00',
      }}
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(10, 6, 2, 0.72)', zIndex: 0 }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div
          style={{
            backgroundColor: 'rgba(18, 12, 4, 0.92)',
            borderRadius: '16px',
            borderTop: '4px solid #FFD700',
            boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
            padding: '40px 32px 32px',
          }}
        >
          {/* Heading */}
          <div className="text-center mb-8">
            <h1
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '2rem',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '6px',
              }}
            >
              Secure Access
            </h1>
            <p style={{ color: '#aaa', fontSize: '14px' }}>
              Library Maintenance System Login
            </p>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* SELECT SYSTEM ROLE */}
            <div>
              <label style={labelStyle}>Select System Role</label>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  style={{
                    ...inputStyle,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ color: selectedRole ? '#000' : '#555' }}>
                    {selectedRole || 'Identify your role'}
                  </span>
                  <ChevronDown
                    size={18}
                    style={{
                      color: '#000',
                      transform: roleDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      flexShrink: 0,
                    }}
                  />
                </button>

                {roleDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      backgroundColor: '#FFD700',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                      zIndex: 50,
                      overflow: 'hidden',
                    }}
                  >
                    {ROLES.map((r, i) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setSelectedRole(r);
                          setRoleDropdownOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '14px 16px',
                          backgroundColor: selectedRole === r ? '#e6c200' : '#FFD700',
                          color: '#000000',
                          fontSize: '15px',
                          fontWeight: selectedRole === r ? '700' : '500',
                          borderBottom: i < ROLES.length - 1 ? '1px solid rgba(0,0,0,0.12)' : 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e6c200';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                            selectedRole === r ? '#e6c200' : '#FFD700';
                        }}
                      >
                        <span>{r}</span>
                        <span
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: '2px solid rgba(0,0,0,0.4)',
                            backgroundColor: selectedRole === r ? '#000' : 'transparent',
                            flexShrink: 0,
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* USERNAME / UNIQUE ID */}
            <div>
              <label style={labelStyle}>Username / Unique ID</label>
              <input
                type="text"
                placeholder="Enter library ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* BATCH / YEAR */}
            <div>
              <label style={labelStyle}>Batch / Year</label>
              <input
                type="text"
                placeholder="e.g. 2024-2025"
                value={batchYear}
                onChange={(e) => setBatchYear(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Remember me + Forgot Password */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#ccc',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#FFD700',
                    cursor: 'pointer',
                  }}
                />
                Remember me
              </label>
              <button
                type="button"
                style={{
                  color: '#FFD700',
                  fontSize: '13px',
                  fontWeight: '600',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Forgot Password?
              </button>
            </div>

            {/* AUTHORIZE LOGIN Button */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoggingIn || isInitializing}
              style={{
                backgroundColor: '#FFD700',
                color: '#000000',
                fontWeight: '700',
                fontSize: '15px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                border: 'none',
                borderRadius: '10px',
                padding: '14px',
                width: '100%',
                cursor: isLoggingIn || isInitializing ? 'not-allowed' : 'pointer',
                opacity: isLoggingIn || isInitializing ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'opacity 0.2s, filter 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isLoggingIn && !isInitializing) {
                  (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1)';
              }}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Connecting...
                </>
              ) : (
                'Authorize Login'
              )}
            </button>

            {/* Return to Main Website */}
            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => navigate({ to: '/' })}
                style={{
                  color: '#aaa',
                  fontSize: '13px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#FFD700';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#aaa';
                }}
              >
                ← Return to Main Website
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Close dropdown on outside click */}
      {roleDropdownOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setRoleDropdownOpen(false)}
        />
      )}
    </div>
  );
}
