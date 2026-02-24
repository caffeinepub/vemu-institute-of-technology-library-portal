import React, { useState, useMemo } from 'react';
import { BookMarked, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllBorrowRecords, useGetAllBooks } from '../../hooks/useQueries';

function formatDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function truncatePrincipal(p: string): string {
  if (p.length <= 16) return p;
  return `${p.slice(0, 8)}...${p.slice(-6)}`;
}

function isOverdue(dueDate: bigint, returnedAt?: bigint): boolean {
  if (returnedAt) return false;
  return Date.now() > Number(dueDate) / 1_000_000;
}

export default function BorrowRecordsTab() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'returned' | 'overdue'>('all');
  const { data: allRecords = [], isLoading } = useGetAllBorrowRecords();
  const { data: books = [] } = useGetAllBooks();

  const bookMap = useMemo(() => {
    const map = new Map<string, string>();
    books.forEach(b => map.set(b.id, b.title));
    return map;
  }, [books]);

  // Flatten records
  const flatRecords = useMemo(() => {
    return allRecords.flatMap(([principal, records]) =>
      records.map(record => ({ principal, record }))
    );
  }, [allRecords]);

  const filtered = useMemo(() => {
    return flatRecords.filter(({ principal, record }) => {
      const bookTitle = bookMap.get(record.bookId) || record.bookId;
      const principalStr = principal.toString();

      const matchesSearch =
        !search ||
        bookTitle.toLowerCase().includes(search.toLowerCase()) ||
        principalStr.toLowerCase().includes(search.toLowerCase());

      const overdue = isOverdue(record.dueDate, record.returnedAt);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !record.returnedAt && !overdue) ||
        (statusFilter === 'returned' && !!record.returnedAt) ||
        (statusFilter === 'overdue' && overdue);

      return matchesSearch && matchesStatus;
    });
  }, [flatRecords, search, statusFilter, bookMap]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading text-xl font-bold">Borrow Records</h2>
        <p className="text-muted-foreground text-sm">{flatRecords.length} total records</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by book title or user..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Records</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Book Title</TableHead>
                <TableHead className="font-semibold">User</TableHead>
                <TableHead className="font-semibold">Borrowed</TableHead>
                <TableHead className="font-semibold">Due Date</TableHead>
                <TableHead className="font-semibold">Returned</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <BookMarked className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No records found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(({ principal, record }, idx) => {
                  const overdue = isOverdue(record.dueDate, record.returnedAt);
                  const bookTitle = bookMap.get(record.bookId) || record.bookId;

                  return (
                    <TableRow key={`${principal}-${record.id}-${idx}`} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-sm max-w-[180px]">
                        <span className="line-clamp-1 font-heading">{bookTitle}</span>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                          {truncatePrincipal(principal.toString())}
                        </code>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(record.borrowedAt)}
                      </TableCell>
                      <TableCell className={`text-sm ${overdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                        {formatDate(record.dueDate)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {record.returnedAt ? formatDate(record.returnedAt) : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={record.returnedAt ? 'secondary' : overdue ? 'destructive' : 'default'}
                          className={
                            record.returnedAt
                              ? 'bg-success/15 text-success border-success/20 text-xs'
                              : overdue
                              ? 'text-xs'
                              : 'bg-navy/10 text-navy dark:bg-gold/10 dark:text-gold border-navy/20 dark:border-gold/20 text-xs'
                          }
                        >
                          {record.returnedAt ? 'Returned' : overdue ? 'Overdue' : 'Active'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
