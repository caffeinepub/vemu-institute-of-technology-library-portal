import React from 'react';
import { useGetDashboardStats, useGetActiveUserCount } from '../../hooks/useQueries';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../backend';
import AnimatedCounter from '../AnimatedCounter';
import { BookOpen, Users, BookMarked, AlertTriangle, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function OverviewTab() {
  const { userRole } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activeCount, isLoading: activeLoading } = useGetActiveUserCount();

  const statCards = [
    {
      title: 'Total Books',
      value: stats ? Number(stats.totalBooks) : 0,
      icon: BookOpen,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Registered Users',
      value: stats ? Number(stats.totalUsers) : 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Books Borrowed',
      value: stats ? Number(stats.booksBorrowed) : 0,
      icon: BookMarked,
      color: 'text-amber-600',
      bg: 'bg-amber-100 dark:bg-amber-900/20',
    },
    {
      title: 'Overdue Books',
      value: stats ? Number(stats.overdueCount) : 0,
      icon: AlertTriangle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">Dashboard Overview</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Real-time statistics for the VEMU Library system.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ title, value, icon: Icon, color, bg }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <AnimatedCounter target={value} className="text-3xl font-bold text-foreground font-heading" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Members Online — admin only */}
      {userRole === UserRole.admin && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
              Members Currently Online
            </CardTitle>
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {activeLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <AnimatedCounter
                target={activeCount !== undefined ? Number(activeCount) : 0}
                className="text-3xl font-bold text-primary font-heading"
              />
            )}
            <p className="text-xs text-muted-foreground mt-1">Live count · refreshes every 30s</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
