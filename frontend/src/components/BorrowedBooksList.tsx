import React from 'react';
import { BookMarked, Loader2, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetMyBorrowHistory, useGetAllBooks, useReturnBook } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { BorrowRecord } from '../backend';

function formatDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function isOverdue(record: BorrowRecord): boolean {
  if (record.returnedAt !== undefined && record.returnedAt !== null) return false;
  const nowNs = BigInt(Date.now()) * 1_000_000n;
  return nowNs > record.dueDate;
}

export default function BorrowedBooksList() {
  const { data: borrowHistory = [], isLoading: historyLoading } = useGetMyBorrowHistory();
  const { data: allBooks = [], isLoading: booksLoading } = useGetAllBooks();
  const returnMutation = useReturnBook();

  const isLoading = historyLoading || booksLoading;

  // Build a map of bookId -> book for quick lookup
  const bookMap = React.useMemo(() => {
    const map = new Map(allBooks.map((b) => [b.id, b]));
    return map;
  }, [allBooks]);

  // Split into active and returned
  const activeRecords = borrowHistory.filter(
    (r) => r.returnedAt === undefined || r.returnedAt === null
  );
  const returnedRecords = borrowHistory.filter(
    (r) => r.returnedAt !== undefined && r.returnedAt !== null
  );

  const handleReturn = async (record: BorrowRecord) => {
    const book = bookMap.get(record.bookId);
    try {
      await returnMutation.mutateAsync(record.bookId);
      toast.success(`Successfully returned "${book?.title ?? record.bookId}"`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to return book';
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  const renderRecord = (record: BorrowRecord, showReturn: boolean) => {
    const book = bookMap.get(record.bookId);
    const overdue = isOverdue(record);
    const isReturning =
      returnMutation.isPending && returnMutation.variables === record.bookId;

    return (
      <div
        key={record.id}
        className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <BookMarked className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">
              {book?.title ?? record.bookId}
            </p>
            <p className="text-xs text-muted-foreground">{book?.author ?? ''}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              <span className="text-xs text-muted-foreground">
                Borrowed: {formatDate(record.borrowedAt)}
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className={`text-xs ${overdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                Due: {formatDate(record.dueDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {record.returnedAt !== undefined && record.returnedAt !== null ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Returned {formatDate(record.returnedAt)}
            </Badge>
          ) : overdue ? (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Overdue
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-600">
              <Clock className="w-3 h-3" />
              Active
            </Badge>
          )}

          {showReturn && (record.returnedAt === undefined || record.returnedAt === null) && (
            <Button
              size="sm"
              variant="outline"
              disabled={isReturning}
              onClick={() => handleReturn(record)}
            >
              {isReturning ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Returning…
                </>
              ) : (
                <>
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Return
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Tabs defaultValue="active" className="space-y-4">
      <TabsList>
        <TabsTrigger value="active">
          Active ({activeRecords.length})
        </TabsTrigger>
        <TabsTrigger value="history">
          History ({returnedRecords.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="space-y-3">
        {activeRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookMarked className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground">No active borrows</p>
            <p className="text-sm text-muted-foreground mt-1">
              Browse the catalog to borrow a book
            </p>
          </div>
        ) : (
          activeRecords.map((record) => renderRecord(record, true))
        )}
      </TabsContent>

      <TabsContent value="history" className="space-y-3">
        {returnedRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookMarked className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground">No borrow history</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your returned books will appear here
            </p>
          </div>
        ) : (
          returnedRecords.map((record) => renderRecord(record, false))
        )}
      </TabsContent>
    </Tabs>
  );
}
