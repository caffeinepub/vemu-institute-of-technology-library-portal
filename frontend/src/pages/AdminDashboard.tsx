import React, { useState, useContext } from 'react';
import { Navigate } from '@tanstack/react-router';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BookMarked,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import OverviewTab from '../components/admin/OverviewTab';
import ManageBooksTab from '../components/admin/ManageBooksTab';
import ManageUsersTab from '../components/admin/ManageUsersTab';
import BorrowRecordsTab from '../components/admin/BorrowRecordsTab';
import { AuthContext } from '../contexts/AuthContext';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

type TabId = 'overview' | 'books' | 'users' | 'records';

const NAV_ITEMS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'books', label: 'Manage Books', icon: BookOpen },
  { id: 'users', label: 'Manage Users', icon: Users },
  { id: 'records', label: 'Borrow Records', icon: BookMarked },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { identity, isInitializing } = useInternetIdentity();
  const { userRole, isLoading: roleLoading } = useContext(AuthContext);

  const isAuthenticated = !!identity;

  // Show loading while initializing
  if (isInitializing || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="w-48 h-4" />
            <Skeleton className="w-32 h-4" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Redirect unauthenticated users
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Show access denied for non-admins (only after role is resolved)
  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold font-heading">Access Denied</h2>
            <p className="text-muted-foreground max-w-sm">
              You don't have permission to access the admin dashboard. Please contact your
              administrator if you believe this is an error.
            </p>
            <Button onClick={() => window.history.back()} variant="outline">
              Go Back
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const activeItem = NAV_ITEMS.find((item) => item.id === activeTab)!;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
            flex-shrink-0 bg-card border-r border-border flex flex-col transition-all duration-200
            ${sidebarCollapsed ? 'w-16' : 'w-56'}
          `}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-3 border-b border-border">
            {!sidebarCollapsed && (
              <span className="text-sm font-semibold text-foreground truncate">Admin Panel</span>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 p-2 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }
                    ${sidebarCollapsed ? 'justify-center' : ''}
                  `}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Page Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
                <activeItem.icon className="w-6 h-6 text-primary" />
                {activeItem.label}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                VEMU Library — Admin Dashboard
              </p>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'books' && <ManageBooksTab />}
            {activeTab === 'users' && <ManageUsersTab />}
            {activeTab === 'records' && <BorrowRecordsTab />}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
