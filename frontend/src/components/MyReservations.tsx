import React, { useMemo, useState } from 'react';
import { BookMarked, X, Loader2, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetMyReservations, useCancelReservation, useGetAllBooks } from '../hooks/useQueries';
import type { Reservation } from '../backend';
import { ReservationStatus } from '../backend';
import { toast } from 'sonner';

function formatDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StatusBadge({ status }: { status: ReservationStatus }) {
  const config = {
    [ReservationStatus.pending]: {
      label: 'Pending',
      className: 'bg-warning/15 text-warning border-warning/30',
      icon: Clock,
    },
    [ReservationStatus.approved]: {
      label: 'Approved',
      className: 'bg-success/15 text-success border-success/30',
      icon: CheckCircle2,
    },
    [ReservationStatus.rejected]: {
      label: 'Rejected',
      className: 'bg-destructive/15 text-destructive border-destructive/30',
      icon: XCircle,
    },
    [ReservationStatus.cancelled]: {
      label: 'Cancelled',
      className: 'bg-muted text-muted-foreground border-border',
      icon: AlertCircle,
    },
  };

  const { label, className, icon: Icon } = config[status] ?? config[ReservationStatus.pending];

  return (
    <Badge variant="outline" className={`gap-1 text-xs ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}

export default function MyReservations() {
  const { data: reservations = [], isLoading } = useGetMyReservations();
  const { data: books = [] } = useGetAllBooks();
  const cancelReservation = useCancelReservation();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const bookMap = useMemo(() => {
    const map = new Map<string, string>();
    books.forEach(b => map.set(b.id, b.title));
    return map;
  }, [books]);

  const sorted = useMemo(() => {
    return [...reservations].sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  }, [reservations]);

  const handleCancel = async (reservation: Reservation) => {
    setCancellingId(reservation.id);
    try {
      await cancelReservation.mutateAsync(reservation.id);
      toast.success('Reservation cancelled successfully.');
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to cancel reservation.');
    } finally {
      setCancellingId(null);
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

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookMarked className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No reservations yet</p>
        <p className="text-sm">Reserve a book from the catalog when copies are unavailable</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map(reservation => {
        const bookTitle = bookMap.get(reservation.bookId) || reservation.bookId;
        const isCancelling = cancellingId === reservation.id;
        const canCancel = reservation.status === ReservationStatus.pending;

        return (
          <div key={reservation.id} className="card-premium p-4 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              reservation.status === ReservationStatus.approved
                ? 'bg-success/10'
                : reservation.status === ReservationStatus.rejected
                ? 'bg-destructive/10'
                : reservation.status === ReservationStatus.cancelled
                ? 'bg-muted'
                : 'bg-warning/10'
            }`}>
              <BookMarked className={`w-5 h-5 ${
                reservation.status === ReservationStatus.approved
                  ? 'text-success'
                  : reservation.status === ReservationStatus.rejected
                  ? 'text-destructive'
                  : reservation.status === ReservationStatus.cancelled
                  ? 'text-muted-foreground'
                  : 'text-warning'
              }`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <h4 className="font-heading font-semibold text-sm truncate">{bookTitle}</h4>
                <StatusBadge status={reservation.status} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                <span>Requested: {formatDate(reservation.createdAt)}</span>
                {reservation.dueDate && (
                  <span className="text-success font-medium">Due: {formatDate(reservation.dueDate)}</span>
                )}
                <span className="font-mono text-xs opacity-60">ID: {reservation.id}</span>
              </div>
            </div>

            {canCancel && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCancel(reservation)}
                disabled={isCancelling}
                className="flex-shrink-0 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/5"
              >
                {isCancelling ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <X className="w-3.5 h-3.5" />
                )}
                Cancel
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
