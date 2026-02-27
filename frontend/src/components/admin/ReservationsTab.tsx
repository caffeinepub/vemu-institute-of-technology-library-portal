import React, { useState, useMemo } from 'react';
import { Search, Filter, CheckCircle, XCircle, Clock, BookMarked } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  useGetAllReservations,
  useApproveReservation,
  useRejectReservation,
  useGetAllBooks,
  useGetAllUsers,
} from '../../hooks/useQueries';
import { ReservationStatus } from '../../backend';
import type { Reservation } from '../../backend';
import { toast } from 'sonner';

function formatDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StatusBadge({ status }: { status: ReservationStatus }) {
  const config: Record<string, { label: string; className: string }> = {
    [ReservationStatus.pending]: { label: 'Pending', className: 'bg-warning/15 text-warning border-warning/30' },
    [ReservationStatus.approved]: { label: 'Approved', className: 'bg-success/15 text-success border-success/30' },
    [ReservationStatus.rejected]: { label: 'Rejected', className: 'bg-destructive/15 text-destructive border-destructive/30' },
    [ReservationStatus.cancelled]: { label: 'Cancelled', className: 'bg-muted text-muted-foreground border-border' },
  };
  const { label, className } = config[status] ?? config[ReservationStatus.pending];
  return <Badge variant="outline" className={`text-xs ${className}`}>{label}</Badge>;
}

export default function ReservationsTab() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionId, setActionId] = useState<string | null>(null);

  const { data: reservations = [], isLoading } = useGetAllReservations();
  const { data: books = [] } = useGetAllBooks();
  const { data: users = [] } = useGetAllUsers();
  const approveReservation = useApproveReservation();
  const rejectReservation = useRejectReservation();

  const bookMap = useMemo(() => {
    const map = new Map<string, string>();
    books.forEach(b => map.set(b.id, b.title));
    return map;
  }, [books]);

  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach(([principal, profile]) => map.set(principal.toString(), profile.name));
    return map;
  }, [users]);

  const sorted = useMemo(() => {
    return [...reservations].sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  }, [reservations]);

  const filtered = useMemo(() => {
    return sorted.filter(r => {
      const bookTitle = bookMap.get(r.bookId) || r.bookId;
      const userName = userMap.get(r.userId.toString()) || r.userId.toString();
      const matchesSearch =
        !search ||
        bookTitle.toLowerCase().includes(search.toLowerCase()) ||
        userName.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sorted, search, statusFilter, bookMap, userMap]);

  const handleApprove = async (reservation: Reservation) => {
    setActionId(reservation.id);
    try {
      await approveReservation.mutateAsync(reservation.id);
      toast.success('Reservation approved successfully.');
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to approve reservation.');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (reservation: Reservation) => {
    setActionId(reservation.id);
    try {
      await rejectReservation.mutateAsync(reservation.id);
      toast.success('Reservation rejected.');
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to reject reservation.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">Reservations</h2>
        <p className="text-muted-foreground text-sm mt-0.5">{reservations.length} total reservations</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by book, student, or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={ReservationStatus.pending}>Pending</SelectItem>
            <SelectItem value={ReservationStatus.approved}>Approved</SelectItem>
            <SelectItem value={ReservationStatus.rejected}>Rejected</SelectItem>
            <SelectItem value={ReservationStatus.cancelled}>Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <BookMarked className="w-8 h-8 opacity-40" />
                      <p className="text-sm">No reservations found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(reservation => {
                  const bookTitle = bookMap.get(reservation.bookId) || reservation.bookId;
                  const userName = userMap.get(reservation.userId.toString()) || 'Unknown';
                  const isPending = reservation.status === ReservationStatus.pending;
                  const isActing = actionId === reservation.id;

                  return (
                    <TableRow key={reservation.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{reservation.id}</TableCell>
                      <TableCell className="font-medium text-sm max-w-[160px] truncate">{bookTitle}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{userName}</TableCell>
                      <TableCell><StatusBadge status={reservation.status} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(reservation.createdAt)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {reservation.dueDate ? formatDate(reservation.dueDate) : '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        {isPending ? (
                          <div className="flex items-center justify-center gap-1">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isActing}
                                  className="gap-1 text-success border-success/30 hover:bg-success/5 h-7 px-2"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Approve
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Approve Reservation</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Approve reservation for "{bookTitle}" by {userName}? This will reduce available copies by 1.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleApprove(reservation)}>
                                    Approve
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isActing}
                                  className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/5 h-7 px-2"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Reject
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Reject Reservation</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Reject reservation for "{bookTitle}" by {userName}?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleReject(reservation)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Reject
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
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
