import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../backend';
import OverviewTab from '../components/admin/OverviewTab';
import ManageBooksTab from '../components/admin/ManageBooksTab';
import ManageUsersTab from '../components/admin/ManageUsersTab';
import BorrowRecordsTab from '../components/admin/BorrowRecordsTab';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardList,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

type TabId = 'overview' | 'books' | 'users' | 'records';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'books', label: 'Manage Books', icon: BookOpen },
  { id: 'users', label: 'Manage Users', icon: Users },
  { id: 'records', label: 'Borrow Records', icon: ClipboardList },
];

export default function AdminDashboard() {
  const { userRole, isRoleLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isRoleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (userRole !== UserRole.admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive font-semibold text-lg">Access Denied</p>
          <p className="text-muted-foreground text-sm mt-1">You do not have admin privileges.</p>
        </div>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'books': return <ManageBooksTab />;
      case 'users': return <ManageUsersTab />;
      case 'records': return <BorrowRecordsTab />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex flex-1">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-30 pt-16
            transform transition-transform duration-200
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:relative lg:translate-x-0 lg:pt-0 lg:z-auto lg:flex lg:flex-col
          `}
        >
          <div className="p-4 border-b border-border">
            <h2 className="font-heading font-bold text-foreground text-sm uppercase tracking-wider">
              Admin Panel
            </h2>
          </div>
          <nav className="flex-1 p-3 flex flex-col gap-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors text-left
                  ${activeTab === id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {activeTab === id && <ChevronRight className="w-3 h-3" />}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="font-heading font-bold text-foreground">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex-1 p-4 lg:p-6 overflow-auto">
            {renderTab()}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
