import React, { useEffect } from 'react';
import { BookOpen, Users, BookMarked, AlertTriangle, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import AnimatedCounter from '../AnimatedCounter';
import { useGetDashboardStats, useGetActiveUserCount } from '../../hooks/useQueries';

export default function OverviewTab() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useGetDashboardStats();
  const { data: activeUsers, isLoading: activeLoading } = useGetActiveUserCount();

  const statCards = [
    {
      title: 'Total Books',
      value: stats ? Number(stats.totalBooks) : 0,
      icon: BookOpen,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Registered Users',
      value: stats ? Number(stats.totalUsers) : 0,
      icon: Users,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      title: 'Books Borrowed',
      value: stats ? Number(stats.booksBorrowed) : 0,
      icon: BookMarked,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
    },
    {
      title: 'Overdue',
      value: stats ? Number(stats.overdueCount) : 0,
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
  ];

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <p className="text-lg font-semibold">Failed to load dashboard stats</p>
        <p className="text-sm text-muted-foreground mt-1">
          {statsError instanceof Error ? statsError.message : 'An unexpected error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-heading">
                <AnimatedCounter target={card.value} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Users Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Members Currently Online
          </CardTitle>
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-purple-500" />
          </div>
        </CardHeader>
        <CardContent>
          {activeLoading ? (
            <Skeleton className="h-9 w-16" />
          ) : (
            <div className="text-3xl font-bold font-heading">
              <AnimatedCounter target={activeUsers ? Number(activeUsers) : 0} />
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">Refreshes every 30 seconds</p>
        </CardContent>
      </Card>
    </div>
  );
}
