import React, { useContext } from 'react';
import { Navigate } from '@tanstack/react-router';
import { BookOpen, BookMarked, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BookCatalog from '../components/BookCatalog';
import BorrowedBooksList from '../components/BorrowedBooksList';
import ProfileSetupModal from '../components/ProfileSetupModal';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { AuthContext } from '../contexts/AuthContext';

export default function StudentDashboard() {
  const { identity, isInitializing } = useInternetIdentity();
  const { isLoading: roleLoading } = useContext(AuthContext);
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // Show loading while II is initializing or role is resolving
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

  const showProfileSetup =
    isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  const displayName = userProfile?.name ?? 'Student';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Profile Setup Modal */}
      {showProfileSetup && <ProfileSetupModal open={true} />}

      {/* Hero Header */}
      <header className="bg-navy text-warm-white py-8 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gold/20 border-2 border-gold/40 flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold">
              Welcome{profileLoading ? '!' : `, ${displayName}!`}
            </h1>
            <p className="text-warm-white/70 text-sm mt-0.5">
              VEMU Library Portal — Student Dashboard
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Browse Books
            </TabsTrigger>
            <TabsTrigger value="borrowed" className="flex items-center gap-2">
              <BookMarked className="w-4 h-4" />
              My Borrowed Books
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <BookCatalog />
          </TabsContent>

          <TabsContent value="borrowed">
            <BorrowedBooksList />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
