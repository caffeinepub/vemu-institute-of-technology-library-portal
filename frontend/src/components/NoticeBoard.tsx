import React from 'react';
import { Bell, AlertTriangle, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllAnnouncements } from '../hooks/useQueries';
import { AnnouncementPriority } from '../backend';
import type { Announcement } from '../backend';

function formatDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface NoticeBoardProps {
  limit?: number;
}

export default function NoticeBoard({ limit }: NoticeBoardProps) {
  const { data: announcements = [], isLoading } = useGetAllAnnouncements();

  const sorted = [...announcements].sort((a, b) => Number(b.publishDate) - Number(a.publishDate));
  const displayed = limit ? sorted.slice(0, limit) : sorted;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (displayed.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No announcements at this time</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayed.map((announcement: Announcement) => {
        const isUrgent = announcement.priority === AnnouncementPriority.urgent;
        return (
          <div
            key={announcement.id}
            className={`rounded-xl border p-4 transition-colors ${
              isUrgent
                ? 'border-destructive/40 bg-destructive/5 dark:bg-destructive/10'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isUrgent ? 'bg-destructive/15' : 'bg-navy/10 dark:bg-gold/10'
              }`}>
                {isUrgent ? (
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                ) : (
                  <Bell className="w-4 h-4 text-navy dark:text-gold" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <h4 className={`font-heading font-semibold text-sm ${isUrgent ? 'text-destructive' : 'text-foreground'}`}>
                    {announcement.title}
                  </h4>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isUrgent && (
                      <Badge variant="destructive" className="text-xs">Urgent</Badge>
                    )}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDate(announcement.publishDate)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-3 leading-relaxed">
                  {announcement.body}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
