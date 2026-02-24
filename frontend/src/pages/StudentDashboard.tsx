import React from 'react';
import { BookOpen, BookMarked, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BookCatalog from '../components/BookCatalog';
import BorrowedBooksList from '../components/BorrowedBooksList';
import { useGetCallerUserProfile } from '../hooks/useQueries';

export default function StudentDashboard() {
  const { data: profile } = useGetCallerUserProfile();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Header */}
      <div className="bg-navy text-warm-white py-8 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gold/20 border-2 border-gold/40 flex items-center justify-center">
              <User className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold">
                Welcome{profile?.name ? `, ${profile.name}` : ''}!
              </h1>
              <p className="text-warm-white/60 text-sm">VEMU Library Portal — Student Dashboard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="browse">
          <TabsList className="mb-6">
            <TabsTrigger value="browse" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Browse Books
            </TabsTrigger>
            <TabsTrigger value="borrowed" className="gap-2">
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
      </div>
    </div>
  );
}
