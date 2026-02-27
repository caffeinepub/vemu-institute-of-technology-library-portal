import React from 'react';
import { User, Mail, Calendar, BookOpen, BookMarked, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetCallerUserProfile, useGetMyBorrowHistory, useGetAllBooks } from '../hooks/useQueries';
import MyReservations from '../components/MyReservations';
import { useMemo } from 'react';

function formatDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isOverdue(dueDate: bigint): boolean {
  return Date.now() > Number(dueDate) / 1_000_000;
}

export default function StudentProfile() {
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: borrowHistory = [], isLoading: historyLoading } = useGetMyBorrowHistory();
  const { data: books = [] } = useGetAllBooks();

  const bookMap = useMemo(() => {
    const map = new Map<string, string>();
    books.forEach(b => map.set(b.id, b.title));
    return map;
  }, [books]);

  const activeLoans = borrowHistory.filter(r => !r.returnedAt);
  const returnedBooks = borrowHistory.filter(r => !!r.returnedAt);

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="card-premium p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-navy/10 dark:bg-gold/10 border-2 border-navy/20 dark:border-gold/20 flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-navy dark:text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-heading text-xl font-bold text-foreground">
              {profile?.name || 'Student'}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
              {profile?.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {profile.email}
                </span>
              )}
              {profile?.joinedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Member since {formatDate(profile.joinedAt)}
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-navy/5 text-navy border-navy/20 dark:bg-gold/5 dark:text-gold dark:border-gold/20">
                {profile?.role || 'Student'}
              </Badge>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                {activeLoans.length} Active Loan{activeLoans.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Active Loans */}
      <div className="card-premium p-5">
        <h3 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-navy dark:text-gold" />
          Active Loans
          <Badge variant="secondary" className="ml-auto">{activeLoans.length}</Badge>
        </h3>
        {historyLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        ) : activeLoans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No active loans</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeLoans.map(record => {
              const overdue = isOverdue(record.dueDate);
              const bookTitle = bookMap.get(record.bookId) || record.bookId;
              return (
                <div key={record.id} className={`flex items-start gap-3 p-3 rounded-lg border ${
                  overdue ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-muted/30'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    overdue ? 'bg-destructive/15' : 'bg-navy/10 dark:bg-gold/10'
                  }`}>
                    {overdue ? (
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    ) : (
                      <BookMarked className="w-4 h-4 text-navy dark:text-gold" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{bookTitle}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Borrowed: {formatDate(record.borrowedAt)}
                      </span>
                      <span className={`flex items-center gap-1 ${overdue ? 'text-destructive font-semibold' : ''}`}>
                        Due: {formatDate(record.dueDate)}
                        {overdue && ' ⚠ Overdue'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Borrow History */}
      <div className="card-premium p-5">
        <h3 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-success" />
          Borrow History
          <Badge variant="secondary" className="ml-auto">{returnedBooks.length}</Badge>
        </h3>
        {historyLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        ) : returnedBooks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No returned books yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {returnedBooks.map(record => {
              const bookTitle = bookMap.get(record.bookId) || record.bookId;
              return (
                <div key={record.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30">
                  <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{bookTitle}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">
                      <span>Borrowed: {formatDate(record.borrowedAt)}</span>
                      {record.returnedAt && (
                        <span className="text-success">Returned: {formatDate(record.returnedAt)}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reservations */}
      <div className="card-premium p-5">
        <h3 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-warning" />
          My Reservations
        </h3>
        <MyReservations />
      </div>
    </div>
  );
}
