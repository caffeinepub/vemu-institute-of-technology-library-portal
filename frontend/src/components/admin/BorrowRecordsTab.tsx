import React, { useState } from 'react';
import { Search, BookMarked, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetAllBorrowRecords, useGetAllBooks } from '../../hooks/useQueries';
import type { BorrowRecord } from '../../backend';

function formatDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

type StatusFilter = 'all' | 'active' | 'returned' | 'overdue';

function getStatus(record: BorrowRecord): 'active' | 'returned' | 'overdue' {
  if (record.returnedAt !== undefined && record.returnedAt !== null) return 'returned';
  const nowNs = BigInt(Date.now()) * 1_000_000n;
  if (nowNs > record.dueDate) return 'overdue';
  return 'active';
}

export default function BorrowRecordsTab() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { data: borrowRecords = [], isLoading: recordsLoading } = useGetAllBorrowRecords();
  const { data: allBooks = [], isLoading: booksLoading } = useGetAllBooks();

  const isLoading = recordsLoading || booksLoading;

  // Build book map
  const bookMap = React.useMemo(() => {
    return new Map(allBooks.map((b) => [b.id, b]));
  }, [allBooks]);

  // Flatten all records with principal info
  const flatRecords = React.useMemo(() => {
    return borrowRecords.flatMap(([principal, records]) =>
      records.map((record) => ({ principal, record }))
    );
  }, [borrowRecords]);

  // Apply filters
  const filteredRecords = React.useMemo(() => {
    return flatRecords.filter(({ principal, record }) => {
      const book = bookMap.get(record.bookId);
      const status = getStatus(record);

      const matchesStatus = statusFilter === 'all' || status === statusFilter;

      const q = search.toLowerCase();
      const matchesSearch =
        q === '' ||
        (book?.title ?? '').toLowerCase().includes(q) ||
        principal.toString().toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [flatRecords, bookMap, search, statusFilter]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by book or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredRecords.length} of {flatRecords.length} records
      </p>

      {/* Table */}
      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookMarked className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg font-semibold">No records found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {flatRecords.length === 0
              ? 'No books have been borrowed yet'
              : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Borrowed</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Returned</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map(({ principal, record }) => {
                const book = bookMap.get(record.bookId);
                const status = getStatus(record);

                return (
                  <TableRow key={`${principal.toString()}-${record.id}`}>
                    <TableCell className="font-medium max-w-[180px] truncate">
                      {book?.title ?? record.bookId}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground max-w-[120px] truncate">
                      {principal.toString().slice(0, 12)}…
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(record.borrowedAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(record.dueDate)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {record.returnedAt !== undefined && record.returnedAt !== null
                        ? formatDate(record.returnedAt)
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {status === 'returned' && (
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          Returned
                        </Badge>
                      )}
                      {status === 'active' && (
                        <Badge variant="outline" className="flex items-center gap-1 w-fit text-green-600 border-green-600">
                          <Clock className="w-3 h-3" />
                          Active
                        </Badge>
                      )}
                      {status === 'overdue' && (
                        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          Overdue
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
