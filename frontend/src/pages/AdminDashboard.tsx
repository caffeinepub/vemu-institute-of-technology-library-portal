import React, { useState } from 'react';
import {
  LayoutDashboard, BookOpen, Users, BookMarked, Menu, X, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import OverviewTab from '../components/admin/OverviewTab';
import ManageBooksTab from '../components/admin/ManageBooksTab';
import ManageUsersTab from '../components/admin/ManageUsersTab';
import BorrowRecordsTab from '../components/admin/BorrowRecordsTab';
import { useGetCallerUserProfile } from '../hooks/useQueries';

type Tab = 'overview' | 'books' | 'users' | 'records';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'books', label: 'Manage Books', icon: BookOpen },
  { id: 'users', label: 'Manage Users', icon: Users },
  { id: 'records', label: 'Borrow Records', icon: BookMarked },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: profile } = useGetCallerUserProfile();

  const ActiveComponent = {
    overview: OverviewTab,
    books: ManageBooksTab,
    users: ManageUsersTab,
    records: BorrowRecordsTab,
  }[activeTab];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-background">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground
        flex flex-col transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        top-16 lg:top-0
      `}>
        {/* Sidebar Header */}
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
              <Shield className="w-4 h-4 text-gold" />
            </div>
            <div>
              <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
              <p className="text-sm font-semibold text-sidebar-foreground truncate max-w-[130px]">
                {profile?.name || 'Administrator'}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-200
                ${activeTab === id
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/40 text-center">VEMU Library Admin</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
          <span className="font-heading font-semibold text-sm">
            {tabs.find(t => t.id === activeTab)?.label}
          </span>
        </div>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}
