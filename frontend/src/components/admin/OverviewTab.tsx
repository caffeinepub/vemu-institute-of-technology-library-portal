import React from 'react';
import { BookOpen, Users, BookMarked, AlertTriangle, TrendingUp } from 'lucide-react';
import { useGetDashboardStats } from '../../hooks/useQueries';
import AnimatedCounter from '../AnimatedCounter';
import { Skeleton } from '@/components/ui/skeleton';

const statConfig = [
  { key: 'totalBooks', label: 'Total Books', icon: BookOpen, color: 'text-navy dark:text-gold', bg: 'bg-navy/10 dark:bg-gold/10' },
  { key: 'totalUsers', label: 'Registered Users', icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { key: 'booksBorrowed', label: 'Books Borrowed', icon: BookMarked, color: 'text-success', bg: 'bg-success/10' },
  { key: 'overdueCount', label: 'Overdue Items', icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
] as const;

export default function OverviewTab() {
  const { data: stats, isLoading, error } = useGetDashboardStats();

  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-destructive opacity-60" />
        <p className="font-medium text-destructive">Failed to load stats</p>
        <p className="text-sm">{(error as Error)?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold mb-1">Library Overview</h2>
        <p className="text-muted-foreground text-sm">Real-time statistics for VEMU Library</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statConfig.map(({ key, label, icon: Icon, color, bg }) => (
          <div key={key} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-muted-foreground/40" />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mb-1" />
            ) : (
              <div className={`text-3xl font-heading font-bold ${color}`}>
                <AnimatedCounter target={Number(stats?.[key] ?? 0)} />
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="card-premium p-6">
        <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-navy dark:text-gold" />
          Quick Summary
        </h3>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
          </div>
        ) : (
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex justify-between">
              <span>Total books in collection</span>
              <span className="font-semibold text-foreground">{Number(stats?.totalBooks ?? 0)}</span>
            </li>
            <li className="flex justify-between">
              <span>Registered library members</span>
              <span className="font-semibold text-foreground">{Number(stats?.totalUsers ?? 0)}</span>
            </li>
            <li className="flex justify-between">
              <span>Currently borrowed</span>
              <span className="font-semibold text-foreground">{Number(stats?.booksBorrowed ?? 0)}</span>
            </li>
            <li className="flex justify-between">
              <span>Overdue returns</span>
              <span className={`font-semibold ${Number(stats?.overdueCount ?? 0) > 0 ? 'text-destructive' : 'text-foreground'}`}>
                {Number(stats?.overdueCount ?? 0)}
              </span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
