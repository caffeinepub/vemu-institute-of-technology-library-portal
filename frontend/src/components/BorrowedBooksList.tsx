import React, { useMemo } from 'react';
import { BookOpen, RotateCcw, Loader2, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetMyBorrowHistory, useReturnBook, useGetAllBooks } from '../hooks/useQueries';
import type { BorrowRecord } from '../backend';
import { toast } from 'sonner';
import { useState } from 'react';

function formatDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isOverdue(dueDate: bigint): boolean {
  return Date.now() > Number(dueDate) / 1_000_000;
}

export default function BorrowedBooksList() {
  const { data: records = [], isLoading } = useGetMyBorrowHistory();
  const { data: books = [] } = useGetAllBooks();
  const returnBook = useReturnBook();
  const [returningId, setReturningId] = useState<string | null>(null);

  const bookMap = useMemo(() => {
    const map = new Map<string, string>();
    books.forEach(b => map.set(b.id, b.title));
    return map;
  }, [books]);

  const active = records.filter(r => !r.returnedAt);
  const history = records.filter(r => !!r.returnedAt);

  const handleReturn = async (record: BorrowRecord) => {
    setReturningId(record.bookId);
    try {
      await returnBook.mutateAsync(record.bookId);
      toast.success('Book returned successfully!');
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to return book');
    } finally {
      setReturningId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  const RecordCard = ({ record, showReturn }: { record: BorrowRecord; showReturn: boolean }) => {
    const overdue = !record.returnedAt && isOverdue(record.dueDate);
    const isReturning = returningId === record.bookId;
    const bookTitle = bookMap.get(record.bookId) || record.bookId;

    return (
      <div className="card-premium p-4 flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          record.returnedAt
            ? 'bg-success/10'
            : overdue
            ? 'bg-destructive/10'
            : 'bg-navy/10 dark:bg-gold/10'
        }`}>
          {record.returnedAt ? (
            <CheckCircle2 className="w-5 h-5 text-success" />
          ) : overdue ? (
            <AlertTriangle className="w-5 h-5 text-destructive" />
          ) : (
            <BookOpen className="w-5 h-5 text-navy dark:text-gold" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-heading font-semibold text-sm truncate">{bookTitle}</h4>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Borrowed: {formatDate(record.borrowedAt)}
            </span>
            <span className={`flex items-center gap-1 ${overdue ? 'text-destructive font-medium' : ''}`}>
              Due: {formatDate(record.dueDate)}
              {overdue && ' (Overdue)'}
            </span>
            {record.returnedAt && (
              <span className="text-success">Returned: {formatDate(record.returnedAt)}</span>
            )}
          </div>
        </div>

        {showReturn && !record.returnedAt && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleReturn(record)}
            disabled={isReturning}
            className="flex-shrink-0 gap-1.5 border-navy/30 text-navy dark:border-gold/30 dark:text-gold hover:bg-navy/5 dark:hover:bg-gold/5"
          >
            {isReturning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5" />
            )}
            Return
          </Button>
        )}
      </div>
    );
  };

  return (
    <Tabs defaultValue="active">
      <TabsList className="mb-4">
        <TabsTrigger value="active">
          Active ({active.length})
        </TabsTrigger>
        <TabsTrigger value="history">
          History ({history.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active">
        {active.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No active borrows</p>
            <p className="text-sm">Browse the catalog to borrow books</p>
          </div>
        ) : (
          <div className="space-y-3">
            {active.map(record => (
              <RecordCard key={record.id} record={record} showReturn={true} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="history">
        {history.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No borrowing history</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(record => (
              <RecordCard key={record.id} record={record} showReturn={false} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
